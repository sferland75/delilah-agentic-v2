import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const baseClasses = "fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-opacity";
  const typeClasses = type === 'success' 
    ? "bg-green-100 text-green-800 border border-green-400"
    : "bg-red-100 text-red-800 border border-red-400";

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <div className="flex items-center">
        <span className="mr-2">
          {type === 'success' ? '✓' : '⚠'}
        </span>
        <p>{message}</p>
        <button
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;