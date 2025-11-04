
import React from 'react';
import { SparklesIcon } from './icons';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-white">
      <SparklesIcon className="w-16 h-16 text-cyan-400 animate-pulse" />
      <p className="mt-4 text-lg font-semibold animate-pulse">{message}</p>
    </div>
  );
};

export default Loader;
