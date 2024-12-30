import { AgentIdentifier, Priority } from '../agent';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastConfig {
    duration?: number;
    variant?: ToastVariant;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export interface BaseToast {
    id: string;
    message: string;
    variant: ToastVariant;
    duration?: number;
    timestamp: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export interface AgentToast extends BaseToast {
    source: AgentIdentifier;
    priority: Priority;
}

export interface SystemToast extends BaseToast {
    system: true;
}

export type Toast = AgentToast | SystemToast;

export interface ToastContextValue {
    toasts: Toast[];
    addToast: (message: string, config?: ToastConfig) => void;
    addAgentToast: (message: string, source: AgentIdentifier, priority: Priority, config?: ToastConfig) => void;
    removeToast: (id: string) => void;
    clearToasts: () => void;
}