import { AgentIdentifier, Priority } from './agent';

export interface ToastConfig {
    title: string;
    message: string;
    duration?: number;
    type?: 'default' | 'success' | 'error' | 'warning' | 'info';
}

export interface AgentToast extends ToastConfig {
    agentId: AgentIdentifier;
    priority: Priority;
}

export interface SystemToast extends ToastConfig {
    type: 'system';
}

export type Toast = AgentToast | SystemToast;

export interface ToastContextValue {
    addToast: (config: ToastConfig) => void;
    removeToast: (id: string) => void;
    toasts: Toast[];
}