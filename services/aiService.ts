import { GoogleGenAI, Type } from "@google/genai";

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

export interface RepoHealthContext {
    filePaths: string[];
    keyFiles: { path: string; content: string }[];
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

    checkRepoHealth: async (context: RepoHealthContext): Promise<string> => {
        const keyFilesSummary = context.keyFiles.map(f => `
<file path="${f.path}">
${f.content.substring(0, 2000)}
</file>
`).join('\n') || 'No key files content provided.';

        const prompt = `
            Analyze the health of a GitHub repository based on its file structure and key file contents.
            You must provide a detailed analysis and a numerical health score from 1 to 100.
            
            **Analysis Context:**
            1.  **Full File List:** A tree of all file paths in the repository has been provided.
            2.  **Key File Contents:** Content for important files like README, package.json, etc., is available.
            
            **File List Snippet (Top 100 files):**
            <file_tree>
            ${context.filePaths.slice(0, 100).join('\n')}
            </file_tree>

            **Key File Contents:**
            ${keyFilesSummary}

            **Scoring Criteria:**
            - **Documentation (40%):** Assess the presence and quality of README.md, CONTRIBUTING.md, and a LICENSE file. Good documentation is clear, comprehensive, and provides setup instructions.
            - **Structure (30%):** Evaluate the logical organization of folders (e.g., separation of 'src', 'tests', 'docs'). Does it follow common conventions for its ecosystem? A clean structure gets a higher score.
            - **Dependencies (20%):** Look at dependency management files (like package.json, requirements.txt). Are dependencies reasonably up-to-date? Are there an excessive number of them? A well-managed project scores higher.
            - **Testing (10%):** Check for the presence of a test suite (e.g., a 'tests' or '__tests__' directory with test files). The presence of tests significantly boosts this part of the score.

            Calculate a final 'health_score' (an integer between 1 and 100) based on these weighted criteria. Your 'analysis' should be a concise paragraph in markdown summarizing your findings.
        `;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            analysis: {
                                type: Type.STRING,
                                description: "A concise, one-paragraph analysis of the repository's health based on the provided context. Summarize findings on documentation, structure, and maintenance. Use markdown for formatting."
                            },
                            health_score: {
                                type: Type.NUMBER,
                                description: "A numerical score from 1 to 100 representing the repository's overall health, based on the weighted criteria."
                            }
                        },
                        required: ["analysis", "health_score"]
                    }
                }
            });

            if (!response.text) {
                throw new Error("The AI returned an empty response.");
            }
            return response.text; // Return the JSON string
        } catch (error: any) {
            console.error("Error calling Gemini API for repo health:", error);
            // We want the friendly message to bubble up to the UI.
            throw new Error(getFriendlyErrorMessage(error));
        }
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