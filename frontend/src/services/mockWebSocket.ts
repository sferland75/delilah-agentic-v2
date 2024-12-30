import { MockDataGenerator } from '../mocks/mockData';
import { AgentMessage } from '../types/agent';
import { BaseWebSocketService } from './WebSocketService';

export class MockWebSocket extends BaseWebSocketService {
    private dataGenerator: MockDataGenerator;
    private updateInterval: NodeJS.Timeout | null = null;

    constructor() {
        super();
        this.dataGenerator = new MockDataGenerator();
    }

    connect(): void {
        // Simulate connection delay
        setTimeout(() => {
            this.handleOpen();
            this.startGeneratingData();
        }, 1000);
    }

    disconnect(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.handleClose();
    }

    send(message: string): void {
        if (!this.connected) {
            console.error('MockWebSocket is not connected');
            return;
        }
        console.log('Mock message sent:', message);
    }

    private startGeneratingData(): void {
        this.updateInterval = setInterval(() => {
            const update = this.dataGenerator.generateSingleUpdate();
            this.handleMessage(update);
        }, 3000);
    }
}

export const createMockWebSocket = (): MockWebSocket => {
    return new MockWebSocket();
};