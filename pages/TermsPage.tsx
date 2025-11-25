import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { ShieldCheck } from 'lucide-react';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-base-50 dark:bg-base-950">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-16 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-white dark:bg-base-900 rounded-2xl border border-base-200 dark:border-base-800 shadow-sm">
                  <ShieldCheck size={40} className="text-primary" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                Terms & Policy
              </h1>
              <p className="text-lg text-gray-600 dark:text-base-300">
                  Effective Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
          </div>
          
          {/* Content */}
          <div className="prose dark:prose-invert max-w-none prose-h2:font-bold prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-10 prose-h2:border-b prose-h2:border-base-200 dark:prose-h2:border-base-800 prose-h2:pb-3 prose-h3:font-semibold prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3 prose-a:text-primary hover:prose-a:underline prose-li:my-1.5 text-gray-700 dark:text-base-300">
              
              <p className="lead text-lg">
                  Welcome to GitRover! This document outlines the rules for using our service and explains how we handle your data. By using our application, you agree to these terms.
              </p>

              <h2>1. Acceptance of Terms</h2>
              <p>
                  By accessing and using GitRover ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these, please do not use this Service.
              </p>

              <h2>2. API Usage & Third-Party Services</h2>
              <p>
                  The Service utilizes the GitHub API and Google Gemini API to provide its functionality. By using our service, you agree to comply with the respective Terms of Service of <a href="https://docs.github.com/en/site-policy/github-terms/github-terms-of-service" target="_blank" rel="noopener noreferrer">GitHub</a> and <a href="https://ai.google/terms/" target="_blank" rel="noopener noreferrer">Google</a>. We are not affiliated with, endorsed by, or sponsored by either company. All data retrieved is subject to their policies.
              </p>

              <h2>3. Privacy Policy: Our Commitment to You</h2>
              <p>
                  We prioritize your privacy. The Service is designed to be client-side only, meaning it does not have a backend database and does not store your personal data on our servers.
              </p>
              <h3>3.1. Data We Store (Locally in Your Browser)</h3>
              <ul>
                  <li><strong>Local Storage:</strong> Your GitHub Personal Access Token, color theme preference, code syntax theme, and other UI settings are stored exclusively in your browser's <code>localStorage</code>. This data never leaves your device and is not transmitted to any server operated by us.</li>
                  <li><strong>Cookie Consent:</strong> We use local storage to remember your consent choice. We do not use tracking or advertising cookies. The term 'cookies' is used here to broadly cover local storage technology.</li>
              </ul>
              <h3>3.2. Data We Process (But Do Not Store)</h3>
              <ul>
                  <li>When you use AI features, the relevant data (e.g., repository metadata, selected code snippets) is sent directly from your browser to the Google Gemini API for processing. This data is not logged or stored by GitRover.</li>
              </ul>
              <h3>3.3. Analytics</h3>
              <p>We do not use any user tracking or analytics scripts (like Google Analytics). We respect your privacy and do not monitor your activity.</p>

              <h2>4. AI Features & Disclaimer</h2>
              <p>
                  The AI features (Summary, Code Explanation, Health Check) are provided "as is" for informational purposes. AI models can make mistakes and produce inaccurate or incomplete information. 
                  You should not rely on the AI-generated content as a sole source of truth and should always verify critical information. GitRover is not responsible for any inaccuracies or damages resulting from the use of AI-generated content.
              </p>

              <h2>5. Disclaimer of Warranties</h2>
              <p>
                  The Service is provided on an 'as is' and 'as available' basis. GitRover makes no warranties, expressed or implied, 
                  and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, 
                  fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights. We do not warrant that the service will be uninterrupted, timely, secure, or error-free.
              </p>
              
              <h2>6. Changes to Terms</h2>
              <p>
                  We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new Terms & Policy on this page. You are advised to review this page periodically for any changes.
              </p>

              <div className="mt-12 pt-8 border-t border-base-200 dark:border-base-800 text-sm text-center">
                  <p>If you have any questions about these Terms, please contact us at <a href="mailto:support@riodev.com">support@riodev.com</a>.</p>
              </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;