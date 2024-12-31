import { useState, useEffect } from 'react';

export function useUnsavedChanges(isDirty: boolean) {
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Prompt the user if they try to leave with unsaved changes
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);

    return {
        showPrompt,
        setShowPrompt
    };
}