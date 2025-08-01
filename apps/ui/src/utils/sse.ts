import { SSEEvent } from '@/types';

export class SSEStream {
  private controller: ReadableStreamDefaultController;
  private encoder = new TextEncoder();

  constructor(controller: ReadableStreamDefaultController) {
    this.controller = controller;
  }

  send(event: Omit<SSEEvent, 'timestamp'>) {
    const sseEvent: SSEEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    const data = `data: ${JSON.stringify(sseEvent)}\n\n`;
    this.controller.enqueue(this.encoder.encode(data));
  }

  sendProgress(message: string, data?: any) {
    this.send({
      type: 'progress',
      message,
      data,
    });
  }

  sendError(message: string, data?: any) {
    this.send({
      type: 'error',
      message,
      data,
    });
  }

  sendSuccess(message: string, data?: any) {
    this.send({
      type: 'success',
      message,
      data,
    });
  }

  close() {
    this.controller.close();
  }
}

export function createSSEResponse(stream: ReadableStream) {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 