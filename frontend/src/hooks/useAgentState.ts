import { useState, useEffect, useCallback } from 'react';
import { AgentState, AgentMessage, InsightData, AgentStatusData } from '../types/agent';
import { WebSocketService } from '../services/WebSocketService';
import { createMockWebSocket } from '../services/mockWebSocket';
import { createRealWebSocket } from '../services/realWebSocket';
import { mockMetrics, mockAgentStatus } from '../mocks/mockData';

const isDevelopment = process.env.NODE_ENV === 'development';
const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:8000/ws';

const initialState: AgentState = {
    activeAgents: isDevelopment ? mockAgentStatus : {},
    metrics: isDevelopment ? mockMetrics : {},
    insights: [],
    errors: [],
    lastUpdate: new Date().toISOString()
};

export function useAgentState() {
    const [ws, setWs] = useState<WebSocketService | null>(null);
    const [state, setState] = useState<AgentState>(initialState);
    const [isConnected, setIsConnected] = useState(false);

    const handleMessage = useCallback((message: AgentMessage) => {
        setState(prev => {
            const update = { ...prev, lastUpdate: new Date().toISOString() };

            switch (message.type) {
                case 'metric_update':
                    update.metrics = {
                        ...update.metrics,
                        [message.metric]: message.data
                    };
                    break;

                case 'insight_generated':
                    const newInsight: InsightData = {
                        id: message.id,
                        message: message.payload.message,
                        priority: message.payload.priority,
                        timestamp: new Date().toISOString(),
                        source: message.source!
                    };
                    update.insights = [newInsight, ...update.insights].slice(0, 50);
                    break;

                case 'session_started':
                case 'session_ended':
                    if (message.source?.id) {
                        const agentId = message.source.id;
                        const currentAgent = prev.activeAgents[agentId] || mockAgentStatus[agentId];
                        
                        if (currentAgent) {
                            const updatedAgent: AgentStatusData = {
                                ...currentAgent,
                                status: message.type === 'session_started' ? 'busy' : 'idle',
                                lastActive: new Date().toISOString()
                            };
                            update.activeAgents = {
                                ...update.activeAgents,
                                [agentId]: updatedAgent
                            };
                        }
                    }
                    break;

                case 'agent_error':
                    update.errors = [message, ...update.errors].slice(0, 20);
                    if (message.source?.id) {
                        const agentId = message.source.id;
                        const currentAgent = prev.activeAgents[agentId];
                        if (currentAgent) {
                            update.activeAgents = {
                                ...update.activeAgents,
                                [agentId]: {
                                    ...currentAgent,
                                    status: 'error',
                                    lastActive: new Date().toISOString()
                                }
                            };
                        }
                    }
                    break;
            }

            return update;
        });
    }, []);

    useEffect(() => {
        const websocket = isDevelopment ? 
            createMockWebSocket() : 
            createRealWebSocket(WEBSOCKET_URL);

        websocket.onOpen(() => setIsConnected(true));
        websocket.onClose(() => setIsConnected(false));
        websocket.onMessage(handleMessage);
        websocket.onError((error) => {
            console.error('WebSocket error:', error);
        });

        websocket.connect();
        setWs(websocket);

        return () => {
            websocket.disconnect();
        };
    }, [handleMessage]);

    const sendMessage = useCallback((message: any) => {
        if (ws?.isConnected()) {
            ws.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not connected');
        }
    }, [ws]);

    const clearInsights = useCallback(() => {
        setState(prev => ({
            ...prev,
            insights: []
        }));
    }, []);

    const clearErrors = useCallback(() => {
        setState(prev => ({
            ...prev,
            errors: []
        }));
    }, []);

    return {
        state,
        isConnected,
        sendMessage,
        clearInsights,
        clearErrors
    };
}