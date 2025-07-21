export function createWebSocket({ onMessage, onOpen, onClose }) {
  const ws = new WebSocket('ws://localhost:8000/ws/realtime');

  ws.onopen = () => {
    if (onOpen) onOpen();
  };

  ws.onmessage = (event) => {
    if (onMessage) onMessage(event.data);
  };

  ws.onclose = () => {
    if (onClose) onClose();
  };

  ws.onerror = (err) => {
    console.error('WebSocket error:', err);
  };

  return ws;
} 