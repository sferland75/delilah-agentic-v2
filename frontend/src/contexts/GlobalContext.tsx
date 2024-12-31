import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from '../components/common/Toast';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface GlobalContextType {
    setLoading: (isLoading: boolean) => void;
    showToast: (message: string, type: 'success' | 'error') => void;
}

const GlobalContext = createContext<GlobalContextType | null>(null);

export const useGlobal = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error('useGlobal must be used within a GlobalProvider');
    }
    return context;
};

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = useCallback((message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    }, []);

    return (
        <GlobalContext.Provider value={{ setLoading, showToast }}>
            {children}
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <LoadingSpinner className="w-12 h-12 text-white" />
                </div>
            )}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </GlobalContext.Provider>
    );
};
