import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cookie_consent');
      if (consent === null) {
        setIsVisible(true);
      }
    } catch (e) {
      // Local storage might be disabled.
      console.warn('Could not access local storage for cookie consent.');
    }
  }, []);

  const handleConsent = (consent: boolean) => {
    try {
      localStorage.setItem('cookie_consent', consent ? 'accepted' : 'declined');
    } catch (e) {
       // Silently fail if storage is not available.
    }
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-fade-in">
      <div className="container mx-auto">
        <div className="bg-white/80 dark:bg-base-900/80 backdrop-blur-lg border border-base-200 dark:border-base-800 rounded-2xl shadow-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start md:items-center text-center md:text-left">
                <Cookie size={40} className="text-primary mr-5 flex-shrink-0 hidden md:block" />
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Our Use of Local Storage</h3>
                    <p className="text-sm text-gray-600 dark:text-base-400 mt-1">
                        This site uses local storage to enhance your experience, like remembering your theme and API token. 
                        We do not use tracking cookies. By clicking "Accept", you agree to our use of this essential functionality. 
                        Learn more in our <Link to="/terms" className="underline font-medium text-primary hover:text-primary">Terms & Policy</Link>.
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
                <button
                    onClick={() => handleConsent(false)}
                    className="px-5 py-2 text-sm font-semibold rounded-lg bg-base-100 dark:bg-base-800 hover:bg-base-200 dark:hover:bg-base-700 transition"
                >
                    Decline
                </button>
                <button
                    onClick={() => handleConsent(true)}
                    className="px-5 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition"
                >
                    Accept
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;