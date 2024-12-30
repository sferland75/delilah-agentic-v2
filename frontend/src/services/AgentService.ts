// services/AgentService.ts

import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

export enum MessageType {
  COMMAND = 'COMMAND',
  QUERY = 'QUERY',
  RESPONSE = 'RESPONSE',
  EVENT = 'EVENT',
  ERROR = 'ERROR',
  STATUS = 'STATUS',
  STREAM = 'STREAM'
}

export enum Priority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3
}

export enum MessageStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface AgentMessage {
  id: string;
  timestamp: string;
  type: MessageType;
  source: AgentIdentifier;
  target: AgentIdentifier;
  priority: Priority;
  payload: MessagePayload;
  metadata: MessageMetadata;
  status: MessageStatus;
  version: string;
}

export interface MessagePayload {
  action: string;
  data: any;
  parameters?: object;
  constraints?: object;
}

export interface MessageMetadata {
  sessionId: string;
  correlationId: string;
  userContext?: object;
  securityContext?: object;
  timeout?: number;
}

export interface AgentIdentifier {
  type: 'FRONTEND' | 'AGENT' | 'BACKEND';
  id: string;
}

class AgentService extends EventEmitter {
  private static instance: AgentService;
  private messageQueue: Map<string, AgentMessage>;
  private activeConnections: Map<string, WebSocket>;
  private retryPolicy: RetryPolicy;

  private constructor() {
    super();
    this.messageQueue = new Map();
    this.activeConnections = new Map();
    this.retryPolicy = new RetryPolicy();
    this.initializeWebSocket();
  }

  static getInstance(): AgentService {
    if (!AgentService.instance) {
      AgentService.instance = new AgentService();
    }
    return AgentService.instance;
  }

  private initializeWebSocket() {
    const ws = new WebSocket(process.env.REACT_APP_AGENT_WS_URL || 'ws://localhost:8000/agents/ws');
    
    ws.onmessage = this.handleWebSocketMessage.bind(this);
    ws.onerror = this.handleWebSocketError.bind(this);
    ws.onclose = this.handleWebSocketClose.bind(this);
  }

  async sendMessage(message: Partial<AgentMessage>): Promise<string> {
    const finalMessage: AgentMessage = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      status: MessageStatus.PENDING,
      version: '1.0',
      ...message
    } as AgentMessage;

    try {
      await this.validateMessage(finalMessage);
      this.messageQueue.set(finalMessage.id, finalMessage);
      await this.transmitMessage(finalMessage);
      return finalMessage.id;
    } catch (error) {
      this.handleError(error, finalMessage);
      throw error;
    }
  }

  async queryAgent(
    targetAgent: string,
    action: string,
    data: any,
    priority: Priority = Priority.NORMAL
  ): Promise<any> {
    const messageId = await this.sendMessage({
      type: MessageType.QUERY,
      source: {
        type: 'FRONTEND',
        id: 'client'
      },
      target: {
        type: 'AGENT',
        id: targetAgent
      },
      priority,
      payload: {
        action,
        data
      },
      metadata: {
        sessionId: this.getCurrentSession(),
        correlationId: uuidv4()
      }
    });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Agent query timeout'));
      }, 30000);

      this.once(`response:${messageId}`, (response) => {
        clearTimeout(timeout);
        resolve(response);
      });

      this.once(`error:${messageId}`, (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  subscribeToAgent(
    agentId: string,
    eventType: string,
    callback: (data: any) => void
  ): () => void {
    const eventName = `${agentId}:${eventType}`;
    this.on(eventName, callback);
    return () => this.off(eventName, callback);
  }

  private async validateMessage(message: AgentMessage): Promise<void> {
    if (!message.target?.id || !message.payload?.action) {
      throw new Error('Invalid message format');
    }
  }

  private async transmitMessage(message: AgentMessage): Promise<void> {
    const connection = this.activeConnections.get(message.target.id);
    if (!connection || connection.readyState !== WebSocket.OPEN) {
      throw new Error('Agent connection not available');
    }

    connection.send(JSON.stringify(message));
    this.updateMessageStatus(message.id, MessageStatus.PROCESSING);
  }

  private handleWebSocketMessage(event: MessageEvent) {
    try {
      const message: AgentMessage = JSON.parse(event.data);
      this.processIncomingMessage(message);
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }

  private handleWebSocketError(event: Event) {
    console.error('WebSocket error:', event);
    this.emit('connection:error', event);
  }

  private handleWebSocketClose(event: CloseEvent) {
    console.log('WebSocket closed:', event);
    this.emit('connection:closed', event);
    // Attempt to reconnect after a delay
    setTimeout(() => this.initializeWebSocket(), 5000);
  }

  private processIncomingMessage(message: AgentMessage) {
    if (message.type === MessageType.RESPONSE) {
      this.emit(`response:${message.metadata.correlationId}`, message.payload);
    } else if (message.type === MessageType.ERROR) {
      this.emit(`error:${message.metadata.correlationId}`, message.payload);
    } else if (message.type === MessageType.EVENT) {
      this.emit(`${message.source.id}:${message.payload.action}`, message.payload.data);
    }

    this.updateMessageStatus(message.id, message.status);
  }

  private updateMessageStatus(messageId: string, status: MessageStatus) {
    const message = this.messageQueue.get(messageId);
    if (message) {
      message.status = status;
      this.messageQueue.set(messageId, message);
      this.emit(`status:${messageId}`, status);
    }
  }

  private handleError(error: any, message: AgentMessage) {
    console.error('Agent communication error:', error);
    this.updateMessageStatus(message.id, MessageStatus.FAILED);
    this.emit(`error:${message.id}`, error);
  }

  private getCurrentSession(): string {
    return localStorage.getItem('sessionId') || uuidv4();
  }
}

class RetryPolicy {
  private maxRetries: number = 3;
  private baseDelay: number = 1000;

  async retry<T>(
    operation: () => Promise<T>,
    context: { messageId: string }
  ): Promise<T> {
    let lastError: Error = new Error('Operation failed after max retries');
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        await this.delay(attempt);
      }
    }

    throw lastError;
  }

  private delay(attempt: number): Promise<void> {
    const delayMs = this.baseDelay * Math.pow(2, attempt);
    return new Promise(resolve => setTimeout(resolve, delayMs));
  }
}

export const agentService = AgentService.getInstance();