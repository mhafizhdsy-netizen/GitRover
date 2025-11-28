
import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client with the API key from process.env.
// Per guidelines, we assume process.env.API_KEY is available and valid.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Parses raw API errors into friendly, human-readable messages.
 */
function getFriendlyErrorMessage(error: any): string {
    const msg = error?.message || error?.toString() || '';

    if (msg.includes('429') || msg.includes('Quota exceeded')) {
        return "⚠️ **Brain Freeze:** The AI has reached its daily thinking limit. Please try again later or check your API quota.";
    }
    
    if (msg.includes('503') || msg.includes('Overloaded')) {
        return "😴 **AI is Nap-taking:** The model is currently overloaded with requests. Please try again in a few moments.";
    }

    if (msg.includes('API key not valid') || msg.includes('API_KEY')) {
        return "🔑 **Key Issue:** The API key appears to be missing or invalid. Please check your settings.";
    }

    if (msg.includes('candidate') && msg.includes('safety')) {
        return "🛡️ **Safety Shield:** The AI could not generate a response because the content triggered safety filters.";
    }

    return "🤖 **Hiccup:** The AI encountered an unexpected error. It might be a temporary glitch.";
}

/**
 * Runs a given prompt against the Gemini API using the Thinking model.
 * @param {string} prompt The prompt to send to the AI.
 * @returns {Promise<string>} The AI's response or an error message.
 */
async function runPrompt(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                thinkingConfig: {
                    thinkingBudget: 32768, 
                },
                // Explicitly NOT setting maxOutputTokens as per instructions to avoid conflict with thinking budget
            }
        });
        
        if (!response.text) {
            return "🤔 The AI thought about it but didn't have anything to say. Try rephrasing your request.";
        }

        return response.text;
    } catch (error: any) {
        console.error("Error calling Gemini API:", error);
        return getFriendlyErrorMessage(error);
    }
}

export interface RepoSummaryContext {
    name: string;
    description: string;
    topics: string[];
    primaryLanguage: string;
    readme: string | null;
}

export interface PRContext {
    title: string;
    body: string;
    user: string;
    files: {filename: string, status: string, additions: number, deletions: number}[];
}

export const aiService = {
    summarizeRepo: (context: RepoSummaryContext): Promise<string> => {
        const prompt = `
            You are an expert technical writer. Generate a concise, one-paragraph summary of the following GitHub repository.
            
            Use the metadata provided below to understand the project, even if the README is empty or missing.
            
            **Repository Metadata:**
            - **Name:** ${context.name}
            - **Description:** ${context.description || 'N/A'}
            - **Primary Language:** ${context.primaryLanguage || 'N/A'}
            - **Topics:** ${context.topics.join(', ') || 'None'}
            
            **README Content Snippet:**
            ---
            ${(context.readme || '').substring(0, 8000)}
            ---
            
            **Goal:** Focus on the main purpose, key features, and intended audience. Avoid jargon where possible. If the README is missing, rely on the description and topics.
        `;
        return runPrompt(prompt);
    },

    checkRepoHealth: (readmeContent: string): Promise<string> => {
        const prompt = `
            Analyze the health of a GitHub repository based on its README.md file. 
            Provide a brief, two-sentence analysis covering:
            1.  Clarity of purpose and documentation.
            2.  Potential red flags or signs of being unmaintained (e.g., outdated info, broken links if mentioned).
            
            Be constructive and focus on what a potential user or contributor should know.
            
            README Content:
            ---
            ${readmeContent.substring(0, 10000)}
            ---
        `;
        return runPrompt(prompt);
    },

    explainCode: (codeSnippet: string): Promise<string> => {
        const prompt = `
            Explain the following code snippet in a clear and concise way. 
            Break down what the code does, its purpose, and any important concepts or syntax. 
            Format your response using markdown for readability.
            
            Code Snippet:
            ---
            \`\`\`
            ${codeSnippet}
            \`\`\`
            ---
        `;
        return runPrompt(prompt);
    },

    reviewPullRequest: (context: PRContext): Promise<string> => {
        const fileList = context.files.map(f => `- ${f.filename} (${f.status}: +${f.additions}, -${f.deletions})`).join('\n');
        
        const prompt = `
            You are a Senior Software Engineer conducting a Pull Request review.
            
            Review the following Pull Request based on its description and the list of modified files.
            
            **PR Title:** ${context.title}
            **Author:** ${context.user}
            **Description:**
            ${context.body || 'No description provided.'}
            
            **Changed Files:**
            ${fileList}
            
            **Instructions:**
            1. **Analyze Intent:** Based on the title and description, does the PR have a clear goal?
            2. **Impact Assessment:** Based on the file list (size of changes, types of files), assess the risk and complexity.
            3. **Recommendations:** Provide 3-4 bullet points on what a reviewer should look for specifically (e.g., "Check for breaking changes in API", "Ensure CSS is scoped").
            
            Keep the tone professional and constructive.
        `;
        return runPrompt(prompt);
    }
};
