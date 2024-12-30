import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  message?: string;
}

export const LoadingState: React.FC<Props> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <LoadingSpinner size="large" />
      <p className="mt-4 text-gray-500">{message}</p>
    </div>
  );
};