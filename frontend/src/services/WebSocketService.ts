import { AgentMessage } from '../types/agent';

export interface WebSocketEventMap {
    message: MessageEvent<string>;
    open: Event;
    close: CloseEvent;
    error: Event;
}

export interface WebSocketService {
    connect(): void;
    disconnect(): void;
    send(message: string): void;
    onMessage(handler: (message: AgentMessage) => void): void;
    onOpen(handler: () => void): void;
    onClose(handler: () => void): void;
    onError(handler: (error: Event) => void): void;
    isConnected(): boolean;
}

export abstract class BaseWebSocketService implements WebSocketService {
    protected connected: boolean = false;
    protected messageHandler?: (message: AgentMessage) => void;
    protected openHandler?: () => void;
    protected closeHandler?: () => void;
    protected errorHandler?: (error: Event) => void;

    abstract connect(): void;
    abstract disconnect(): void;
    abstract send(message: string): void;

    onMessage(handler: (message: AgentMessage) => void): void {
        this.messageHandler = handler;
    }

    onOpen(handler: () => void): void {
        this.openHandler = handler;
    }

    onClose(handler: () => void): void {
        this.closeHandler = handler;
    }

    onError(handler: (error: Event) => void): void {
        this.errorHandler = handler;
    }

    isConnected(): boolean {
        return this.connected;
    }

    protected handleOpen(): void {
        this.connected = true;
        this.openHandler?.();
    }

    protected handleClose(): void {
        this.connected = false;
        this.closeHandler?.();
    }

    protected handleError(error: Event): void {
        this.errorHandler?.(error);
    }

    protected handleMessage(message: AgentMessage): void {
        this.messageHandler?.(message);
    }
}