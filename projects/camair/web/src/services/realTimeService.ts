import type { AirQualityRecord } from '../types/air-quality.types';

type MessageHandler = (data: AirQualityRecord[]) => void;

class RealTimeService {
  private ws: WebSocket | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private url: string;
  private reconnectAttempts = 0;
  private maxRetries = 10;

  constructor() {
    const baseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    this.url = `${baseUrl}/ws`;
  }

  subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect();
    }
    return () => this.handlers.delete(handler);
  }

  private connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'air_quality' && Array.isArray(message.data)) {
          this.handlers.forEach((h) => h(message.data));
        }
      } catch {
        console.warn('Failed to parse WebSocket message');
      }
    };

    this.ws.onclose = () => {
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
    this.handlers.clear();
  }
}

export const realTimeService = new RealTimeService();
