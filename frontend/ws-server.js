#!/usr/bin/env node
// Simple websocket server (ESM) that broadcasts mock driver locations every 3 seconds.
// Usage: node ws-server.js

import { WebSocketServer } from 'ws';
const wss = new WebSocketServer({ port: 4001 });

console.log('WebSocket server listening on ws://localhost:4001');

// initial mock drivers
let drivers = [
  { id: 'd1', lat: 12.9716, lng: 77.5946, label: 'Driver A' },
  { id: 'd2', lat: 12.975, lng: 77.59, label: 'Driver B' },
  { id: 'd3', lat: 12.968, lng: 77.6, label: 'Driver C' },
];

function broadcast(obj) {
  const s = JSON.stringify(obj);
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(s);
  }
}

wss.on('connection', (ws) => {
  console.log('client connected');
  // send initial list
  ws.send(JSON.stringify({ type: 'drivers:init', drivers }));

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      // naive echo for demo
      if (data.type === 'echo') ws.send(JSON.stringify({ type: 'echo', payload: data.payload }));
    } catch (e) {}
  });

  ws.on('close', () => console.log('client disconnected'));
});

// move drivers randomly a bit and broadcast updates
setInterval(() => {
  drivers = drivers.map((d) => {
    const jitter = (Math.random() - 0.5) * 0.0025;
    const jitter2 = (Math.random() - 0.5) * 0.0025;
    return { ...d, lat: d.lat + jitter, lng: d.lng + jitter2 };
  });
  broadcast({ type: 'drivers:update', drivers });
}, 3000);
