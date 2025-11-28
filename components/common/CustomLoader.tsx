
import React from 'react';
import { GitRoverLoadingIcon } from '../../assets/icon';

interface CustomLoaderProps {
  size?: number;
  className?: string;
  text?: string;
}

const CustomLoader: React.FC<CustomLoaderProps> = ({ size = 48, className = '', text }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <GitRoverLoadingIcon width={size} height={size} />
      {text && (
        <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default CustomLoader;
