import type { AirQualityRecord } from '../types/air-quality.types';

type MessageType = 'air_quality' | 'weather' | 'uv';

interface RealTimeMessage {
  type: MessageType;
  data: any[];
}

type MessageHandler = (data: any) => void;

class RealTimeService {
  private ws: WebSocket | null = null;
  private handlers: Map<MessageType, Set<MessageHandler>> = new Map();
  private url: string;
  private reconnectAttempts = 0;
  private maxRetries = 10;

  constructor() {
    const baseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    this.url = `${baseUrl}/ws`;
    this.handlers.set('air_quality', new Set());
    this.handlers.set('weather', new Set());
    this.handlers.set('uv', new Set());
  }

  subscribe(type: MessageType, handler: MessageHandler): () => void {
    this.handlers.get(type)?.add(handler);
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect();
    }
    return () => this.handlers.get(type)?.delete(handler);
  }

  private connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const message: RealTimeMessage = JSON.parse(event.data);
        const typeHandlers = this.handlers.get(message.type);
        if (typeHandlers && Array.isArray(message.data)) {
          typeHandlers.forEach((h) => h(message.data));
        }
      } catch {
        console.warn('Failed to parse WebSocket message');
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      if (this.reconnectAttempts < this.maxRetries) {
        const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
        setTimeout(() => this.connect(), delay);
        this.reconnectAttempts++;
      }
    };
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
    this.handlers.forEach((set) => set.clear());
  }
}

export const realTimeService = new RealTimeService();
