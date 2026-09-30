/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { socket as sharedSocket } from "../services/socket/socket";

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { isAuthenticated, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketError, setSocketError] = useState(null);

  useEffect(() => {
    sharedSocket.auth = { token: isAuthenticated ? token : null };
    if (sharedSocket.connected) {
      sharedSocket.disconnect();
      if (isAuthenticated) sharedSocket.connect();
    }
  }, [isAuthenticated, token]);

  const value = {
    socket,
    setSocket,
    isConnected,
    setIsConnected,
    socketError,
    setSocketError
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
