import React, { createContext, useContext } from 'react';
import { useToast as useToastHook } from '@/components/ui/use-toast';

export const ToastContext = createContext<ReturnType<typeof useToastHook> | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toast = useToastHook();

  return (
    <ToastContext.Provider value={toast}>
      {children}
    </ToastContext.Provider>
  );
};