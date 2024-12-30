import { AgentMessage } from '../types/agent';
import { BaseWebSocketService } from './WebSocketService';

export class RealWebSocket extends BaseWebSocketService {
    private ws: WebSocket | null = null;
    private url: string;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectTimeout: NodeJS.Timeout | null = null;

    constructor(url: string) {
        super();
        this.url = url;
    }

    connect(): void {
        try {
            this.ws = new WebSocket(this.url);
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            this.handleError(new Event('error'));
            this.attemptReconnect();
        }
    }

    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }

    send(message: string): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket is not connected');
            return;
        }
        this.ws.send(message);
    }

    private setupEventListeners(): void {
        if (!this.ws) return;

        this.ws.onopen = () => {
            this.reconnectAttempts = 0;
            this.handleOpen();
        };

        this.ws.onclose = () => {
            this.handleClose();
            this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
            this.handleError(error);
        };

        this.ws.onmessage = (event) => {
            try {
                const message: AgentMessage = JSON.parse(event.data);
                this.handleMessage(message);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
    }

    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);

        this.reconnectTimeout = setTimeout(() => {
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            this.connect();
        }, delay);
    }
}

export const createRealWebSocket = (url: string): RealWebSocket => {
    return new RealWebSocket(url);
};