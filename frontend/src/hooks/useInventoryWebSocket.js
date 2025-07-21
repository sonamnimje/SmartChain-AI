import { useEffect } from 'react';

export function useInventoryWebSocket(onMessage) {
  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:8000/alerts/ws');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };
    ws.onclose = () => {
      console.log('WebSocket closed');
    };
    return () => ws.close();
  }, [onMessage]);
} 