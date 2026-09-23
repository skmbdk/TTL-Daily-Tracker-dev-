import { io } from 'socket.io-client';

let socket;
let activeToken;

const resolveSocketUrl = () => {
  const explicitUrl = import.meta.env.VITE_SOCKET_URL?.trim();
  if (explicitUrl) return explicitUrl;

  const apiUrl = import.meta.env.VITE_API_URL?.trim();
  if (!apiUrl || apiUrl.startsWith('/')) return window.location.origin;

  const parsed = new URL(apiUrl);
  return parsed.origin;
};

export const connectSocket = () => {
  const token = sessionStorage.getItem('zira_token');
  if (!token) return null;

  if (socket && activeToken === token) {
    if (!socket.connected) socket.connect();
    return socket;
  }

  disconnectSocket();
  activeToken = token;
  socket = io(resolveSocketUrl(), {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }
  socket = undefined;
  activeToken = undefined;
};

export const getSocket = () => socket;
