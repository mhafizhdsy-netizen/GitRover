
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ErrorDisplay from '../components/common/ErrorDisplay';
import { Home } from 'lucide-react';

const ErrorPage: React.FC = () => {
  const location = useLocation();
  // Allow passing an error object via navigation state
  const stateError = location.state?.error;

  const default404 = {
    response: { status: 404 },
    message: "The page you are looking for does not exist."
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <ErrorDisplay error={stateError || default404} fullScreen={true} />
        
        <Link
          to="/"
          className="mt-6 flex items-center px-6 py-3 bg-base-100 dark:bg-base-800 text-gray-700 dark:text-white font-semibold rounded-lg hover:bg-base-200 dark:hover:bg-base-700 transition-colors"
        >
          <Home size={18} className="mr-2" />
          Go back home
        </Link>
      </div>
      <Footer />
    </div>
  );
};

export default ErrorPage;
