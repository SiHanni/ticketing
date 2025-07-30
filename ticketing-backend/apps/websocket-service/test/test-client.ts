import { io } from 'socket.io-client';

const userId = 6;
const eventId = 3;

const socket = io('ws://localhost:3006', {
  query: { userId, eventId },
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server');
});

socket.on('queue-position', (msg) => {
  console.log('📩 Queue Position Received:', msg);
});

socket.on('error', (err) => {
  console.error('❌ Error:', err);
});

socket.on('disconnect', () => {
  console.log('🔌 Disconnected from server');
});
