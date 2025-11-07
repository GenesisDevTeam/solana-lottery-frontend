import { eventBroadcaster } from '@/lib/event-broadcaster';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  // Создаем SSE stream
  const encoder = new TextEncoder();
  
  let unsubscribe: (() => void) | null = null;
  
  const stream = new ReadableStream({
    start(controller) {
      // Отправляем начальное сообщение
      const data = `data: ${JSON.stringify({ type: 'connected' })}\n\n`;
      controller.enqueue(encoder.encode(data));
      
      // Подписываемся на события
      unsubscribe = eventBroadcaster.subscribe((eventData) => {
        try {
          const data = `data: ${JSON.stringify(eventData)}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch (error) {
          console.error('[SSE] Error encoding event:', error);
        }
      });
      
      console.log(`[SSE] Client connected. Active listeners: ${eventBroadcaster.getListenerCount()}`);
    },
    cancel() {
      if (unsubscribe) {
        unsubscribe();
      }
      console.log(`[SSE] Client disconnected. Active listeners: ${eventBroadcaster.getListenerCount()}`);
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

