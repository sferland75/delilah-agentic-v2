import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  error: Error | string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<Props> = ({ error, onRetry }) => {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <AlertOctagon className="h-12 w-12 text-red-500" />
      <h2 className="mt-4 text-lg font-medium text-gray-900">Something went wrong</h2>
      <p className="mt-2 text-sm text-gray-500">{errorMessage}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </button>
      )}
    </div>
  );
};