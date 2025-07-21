import React, { useEffect, useRef, useState } from 'react';
import { createWebSocket } from '../utils/websocket';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const wsRef = useRef(null);
  
  useEffect(() => {
    wsRef.current = createWebSocket({
      onMessage: (msg) => {
        let parsed;
        try {
          parsed = JSON.parse(msg);
        } catch {
          setMessages((prev) => [...prev, { sender: 'server', text: msg }]);
          return;
        }
        if (parsed.type === 'inventory_update') {
          setMessages((prev) => [...prev, { sender: 'bot', text: `Inventory update: ${parsed.data.product} stock is now ${parsed.data.new_stock}.` }]);
        } else if (parsed.type === 'order_update') {
          setMessages((prev) => [...prev, { sender: 'bot', text: `Order update: Order #${parsed.data.order_id} for ${parsed.data.product} (${parsed.data.quantity}) for ${parsed.data.customer} is now ${parsed.data.status}.` }]);
        } else if (parsed.type === 'shipment_update') {
          setMessages((prev) => [...prev, { sender: 'bot', text: `Shipment update: Shipment #${parsed.data.shipment_id} for Order #${parsed.data.order_id} is now ${parsed.data.status}.` }]);
        } else if (parsed.type === 'alert') {
          setMessages((prev) => [...prev, { sender: 'bot', text: `ALERT: ${parsed.data.message}` }]);
        } else {
          setMessages((prev) => [...prev, { sender: 'server', text: msg }]);
        }
      },
      onOpen: () => setMessages((prev) => [...prev, { sender: 'system', text: 'Connected to real-time backend.' }]),
      onClose: () => setMessages((prev) => [...prev, { sender: 'system', text: 'Disconnected from backend.' }]),
    });
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const handleSend = async () => {
    if (input.trim()) {
      setMessages((prev) => [...prev, { sender: 'user', text: input }]);
      try {
        const response = await fetch('http://localhost:8000/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input })
        });
        const data = await response.json();
        setMessages((prev) => [...prev, { sender: 'bot', text: data.reply }]);
      } catch (err) {
        setMessages((prev) => [...prev, { sender: 'bot', text: 'Error: Could not reach chatbot backend.' }]);
      }
      setInput('');
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chatbot-message chatbot-message-${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chatbot-input-bar">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default Chatbot; 