import React, { useState, useCallback } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { Scale, CheckCircle2, Info, AlertTriangle, Copy, Check } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';


const SummaryCard: React.FC<{
  icon: React.ElementType;
  title: string;
  color: 'green' | 'blue' | 'yellow';
  items: string[];
}> = ({ icon: Icon, title, color, items }) => {

  const colorClasses = {
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      hoverBorder: 'hover:border-green-400/50 dark:hover:border-green-500/50'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      hoverBorder: 'hover:border-blue-400/50 dark:hover:border-blue-500/50'
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      icon: 'text-yellow-600 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-800',
      hoverBorder: 'hover:border-yellow-400/50 dark:hover:border-yellow-500/50'
    }
  };
  
  const selectedColor = colorClasses[color];

  return (
    <div className={`
      flex flex-col p-6 rounded-2xl border transition-all duration-300
      bg-white dark:bg-base-900 shadow-sm
      ${selectedColor.border}
      ${selectedColor.hoverBorder}
      hover:-translate-y-1
    `}>
      <div className={`flex items-center mb-4`}>
        <div className={`p-2 rounded-lg mr-3 ${selectedColor.bg}`}>
          <Icon size={24} className={selectedColor.icon} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start text-sm text-gray-600 dark:text-base-300">
            <CheckCircle2 size={14} className={`flex-shrink-0 mr-2.5 mt-1 ${selectedColor.icon}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};


const LicensePage: React.FC = () => {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const year = new Date().getFullYear();
  const owner = "RioDev"; // Sesuai dengan footer

  const licenseText = `MIT License

Copyright (c) ${year} ${owner}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
  `.trim();

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(licenseText).then(() => {
      setCopied(true);
      addToast('License text copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    });
  }, [licenseText, addToast]);


  return (
    <div className="min-h-screen flex flex-col bg-base-50 dark:bg-base-950">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-16 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-white dark:bg-base-900 rounded-2xl border border-base-200 dark:border-base-800 shadow-sm">
                  <Scale size={40} className="text-primary" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                MIT License
              </h1>
              <p className="text-lg text-gray-600 dark:text-base-300">
                  GitRover is an open source project licensed under the MIT License. This page provides a summary of what you can and cannot do.
              </p>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <SummaryCard
              title="Permissions"
              icon={CheckCircle2}
              color="green"
              items={['Commercial Use', 'Modification', 'Distribution', 'Private Use']}
            />
            <SummaryCard
              title="Conditions"
              icon={Info}
              color="blue"
              items={['License and copyright notice must be included with the software.']}
            />
            <SummaryCard
              title="Limitations"
              icon={AlertTriangle}
              color="yellow"
              items={['No Liability', 'No Warranty']}
            />
          </div>

          <div className="text-center text-xs text-gray-400 dark:text-gray-500 mb-12">
            Disclaimer: This is not legal advice. The information on this page is for informational purposes only.
          </div>

          {/* Full License Text */}
          <div className="bg-white dark:bg-base-900 rounded-2xl border border-base-200 dark:border-base-800 shadow-sm">
            <header className="flex items-center justify-between p-4 border-b border-base-200 dark:border-base-800">
              <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">Full License Text</h3>
              <button
                onClick={handleCopy}
                className="flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-base-100 dark:bg-base-800 hover:bg-base-200 dark:hover:bg-base-700 transition"
              >
                {copied ? <Check size={14} className="mr-1.5 text-green-500" /> : <Copy size={14} className="mr-1.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </header>
            <div className="p-6">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 dark:text-base-300 leading-relaxed">
                {licenseText}
                </pre>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LicensePage;
