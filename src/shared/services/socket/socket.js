import { io } from "socket.io-client";
import { SOCKET_URL } from "../../config/api";

const socketOptions = {
  auth: (callback) => {
    try {
      const storedAuth = JSON.parse(localStorage.getItem("kuizroom_host_auth") || "{}");
      callback({ token: storedAuth.token || null });
    } catch {
      callback({ token: null });
    }
  },
  transports: ["websocket", "polling"],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  withCredentials: true,
};

export const socket = io(SOCKET_URL, socketOptions);

export const connectSocket = () => {
  if (!socket.connected && !socket.active) {
    socket.connect();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
