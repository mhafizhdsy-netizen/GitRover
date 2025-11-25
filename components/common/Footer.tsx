import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GitRoverIcon } from '../../assets/icon';
import { Github, Instagram, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const location = useLocation();
  
  // Pages that require the full, detailed footer
  const fullFooterRoutes = ['/', '/about', '/terms', '/docs', '/roadmap', '/license'];
  const isFullFooter = fullFooterRoutes.includes(location.pathname);

  if (!isFullFooter) {
    return (
      <footer className="bg-base-50 dark:bg-base-950 border-t border-base-200 dark:border-base-800 py-6 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 dark:text-base-400">
          <div className="flex items-center mb-3 md:mb-0">
             <GitRoverIcon className="w-4 h-4 mr-2 opacity-50" />
             <span className="font-medium">&copy; {new Date().getFullYear()} GitRover</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/about" className="hover:text-primary transition-colors">About</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms & Policy</Link>
            <Link to="/license" className="hover:text-primary transition-colors">License</Link>
            <div className="flex items-center pl-2 border-l border-base-300 dark:border-base-700">
                <span>Made with</span>
                <Heart size={12} className="mx-1 text-red-500 fill-red-500" />
                <span>by <strong className="text-primary">RioDev</strong></span>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white dark:bg-base-950 border-t border-base-200 dark:border-base-800 pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-6 lg:col-span-4 flex flex-col items-start">
            <Link to="/" className="flex items-center space-x-2 mb-6 group">
              <GitRoverIcon className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-bold text-2xl text-gray-800 dark:text-gray-100 tracking-tight">GitRover</span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-base-400 leading-relaxed max-w-sm">
              Explore the open-source world with a modern, AI-enhanced interface. 
              Discover repositories, analyze code, and connect with developers in a distraction-free environment.
            </p>
          </div>

          {/* Spacer/Grid alignment */}
          <div className="hidden lg:block lg:col-span-1"></div>
          
          {/* Resources */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <h4 className="font-bold text-gray-900 dark:text-white mb-6">Resources</h4>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-base-400">
              <li><Link to="/" className="hover:text-primary transition-colors block py-1">Home</Link></li>
              <li><Link to="/search" className="hover:text-primary transition-colors block py-1">Explore</Link></li>
              <li><Link to="/docs" className="hover:text-primary transition-colors block py-1">Documentation</Link></li>
              <li><Link to="/roadmap" className="hover:text-primary transition-colors block py-1">Roadmap</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <h4 className="font-bold text-gray-900 dark:text-white mb-6">Company</h4>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-base-400">
              <li><Link to="/about" className="hover:text-primary transition-colors block py-1">About</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors block py-1">Terms & Policy</Link></li>
              <li><Link to="/license" className="hover:text-primary transition-colors block py-1">License</Link></li>
            </ul>
          </div>

          {/* Connect Section */}
          <div className="col-span-2 md:col-span-2 lg:col-span-3">
            <h4 className="font-bold text-gray-900 dark:text-white mb-6">Connect</h4>
            <div className="flex gap-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 bg-base-100 dark:bg-base-900 rounded-full hover:bg-black hover:text-white transition-all text-gray-600 dark:text-base-400 border border-transparent hover:border-black/20 group shadow-sm" 
                aria-label="GitHub"
              >
                <Github size={20} className="group-hover:scale-110 transition-transform" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 bg-base-100 dark:bg-base-900 rounded-full hover:bg-pink-500 hover:text-white transition-all text-gray-600 dark:text-base-400 border border-transparent hover:border-pink-500/20 group shadow-sm" 
                aria-label="Instagram"
              >
                <Instagram size={20} className="group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-base-200 dark:border-base-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-base-500">
          <p>&copy; {new Date().getFullYear()} GitRover. All rights reserved.</p>
          <div className="flex items-center mt-4 md:mt-0 bg-base-100 dark:bg-base-900 px-4 py-1.5 rounded-full border border-base-200 dark:border-base-800">
            <span className="text-xs">Made with</span>
            <Heart size={12} className="mx-1.5 text-red-500 fill-red-500 animate-pulse" />
            <span className="text-xs">by <strong className="text-gray-900 dark:text-white">RioDev</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;