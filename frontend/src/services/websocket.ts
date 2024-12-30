import { AgentMessage, InsightMessage, AgentError, SessionUpdate } from '../types/agent';
import { EventEmitter } from 'events';

export class WebSocketService extends EventEmitter {
    private ws: WebSocket | null = null;
    private url: string;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;

    constructor(url: string) {
        super();
        this.url = url;
    }

    connect() {
        try {
            this.ws = new WebSocket(this.url);
            this.setupListeners();
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.handleReconnect();
        }
    }

    private setupListeners() {
        if (!this.ws) return;

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleMessage(message);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
            this.handleReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
            this.emit('connected');
        };
    }

    private handleMessage(message: AgentMessage) {
        switch (message.type) {
            case 'metric_update':
                this.emit('metricUpdate', message.data);
                break;
            case 'agent_error':
                this.handleAgentError(message);
                break;
            case 'session_started':
            case 'session_ended':
                this.handleSessionUpdate(message);
                break;
            case 'insight_generated':
                this.handleInsightUpdate(message);
                break;
        }
    }

    private handleAgentError(message: AgentError) {
        this.emit('agentError', {
            agentId: message.source?.id,
            error: message.error,
            timestamp: new Date().toISOString()
        });
    }

    private handleSessionUpdate(message: SessionUpdate) {
        this.emit('sessionUpdate', {
            agentId: message.source?.id,
            status: message.type === 'session_started' ? 'active' : 'ended',
            timestamp: new Date().toISOString()
        });
    }

    private handleInsightUpdate(message: InsightMessage) {
        if (!message.source) return;
        
        this.emit('insightGenerated', {
            id: message.id,
            message: message.payload.message,
            priority: message.payload.priority,
            timestamp: new Date().toISOString(),
            source: message.source
        });
    }

    private handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = 1000 * Math.pow(2, this.reconnectAttempts - 1);
            console.log(`Attempting to reconnect in ${delay}ms...`);
            setTimeout(() => this.connect(), delay);
        } else {
            this.emit('connectionFailed');
        }
    }

    send(data: any) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.error('WebSocket is not connected');
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}