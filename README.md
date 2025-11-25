# GitRover 🛰️

**Explore Code. Understand Faster.**

A modern, minimalist, AI-powered web application for exploring GitHub repositories.

<p align="center">
  <a href="#-features">Features</a> ·
  <a href="#-tech-stack">Tech Stack</a> ·
  <a href="#-getting-started">Getting Started</a> ·
  <a href="#-license">License</a>
</p>

---

## 🚀 Features

GitRover is designed to enhance the experience of reading and understanding code on GitHub.

-   **✨ Minimalist UI**: A clean, distraction-free interface that puts the content first. Dark mode is a first-class citizen.
-   **⚡ Blazing Fast**: Built with modern tools for near-instant page loads and a fluid user experience.
-   **🤖 AI-Powered Insights**:
    -   **Summarize Repo**: Get a concise, AI-generated summary of any repository.
    -   **Explain Code**: Select any code snippet to receive a detailed explanation in plain English.
    -   **Repo Health Check**: Quickly assess a repository's documentation quality and potential red flags.
-   **📂 Advanced File Explorer**: Navigate code with a responsive file tree, branch selector, and folder size calculations.
-   **🎨 Customizable Themes**: Personalize your code-viewing experience with multiple syntax highlighting themes and color palettes.
-   **🔒 Secure & Private**: Your GitHub tokens are stored exclusively in your browser's local storage and never leave your device.

## 🛠️ Tech Stack

-   **Framework**: React (with Vite)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **API Integration**: Axios for GitHub API calls
-   **AI**: Google Gemini API via `@google/genai`
-   **Routing**: React Router
-   **UI Components**: Lucide React for icons

## 🏃 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (v18 or later)
-   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/gitrover.git
    cd gitrover
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your Google Gemini API key. This app uses Vite, which exposes env variables prefixed with `VITE_`. For the Gemini SDK which expects `process.env.API_KEY`, a special configuration is included in `vite.config.ts` to define this variable.
    ```env
    # Get your key from Google AI Studio
    API_KEY="YOUR_GEMINI_API_KEY"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open your browser to the local URL provided by Vite to view the application.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
