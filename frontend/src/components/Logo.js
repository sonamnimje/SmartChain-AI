import React from 'react';

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <img src="/logo.png" alt="Smart Chain AI Logo" style={{ height: 64 }} />
      <span style={{ fontSize: 32, fontWeight: 'bold', color: '#1a365d' }}>
        Smart Chain AI
      </span>
    </div>
  );
}

export default Logo; 