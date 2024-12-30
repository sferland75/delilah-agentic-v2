import React, { createContext, useContext, useCallback, useState } from 'react';
import { Toast, ToastConfig, ToastContextValue, AgentToast, SystemToast } from '../../types/toast';
import { AgentIdentifier, Priority } from '../../types/agent';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { X } from 'lucide-react';

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, config?: ToastConfig) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: SystemToast = {
      id,
      message,
      variant: config?.variant || 'info',
      duration: config?.duration || 5000,
      timestamp: new Date().toISOString(),
      action: config?.action,
      system: true
    };

    setToasts(prev => [...prev, newToast]);

    if (newToast.duration) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const addAgentToast = useCallback((
    message: string,
    source: AgentIdentifier,
    priority: Priority,
    config?: ToastConfig
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: AgentToast = {
      id,
      message,
      source,
      priority,
      variant: config?.variant || 'info',
      duration: config?.duration || 5000,
      timestamp: new Date().toISOString(),
      action: config?.action
    };

    setToasts(prev => [...prev, newToast]);

    if (newToast.duration) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, addAgentToast, removeToast, clearToasts }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <Alert
            key={toast.id}
            variant={toast.variant}
            className="w-96 shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <AlertTitle className="text-sm font-medium">
                  {'source' in toast ? `${toast.source.type} Agent` : 'System'}
                </AlertTitle>
                <p className="mt-1 text-sm">{toast.message}</p>
                {toast.action && (
                  <button
                    onClick={toast.action.onClick}
                    className="mt-2 text-sm font-medium text-primary hover:underline"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </Alert>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;