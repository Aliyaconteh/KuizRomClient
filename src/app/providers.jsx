import { GameProvider } from "./contexts/GameContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { RoomProvider } from "./contexts/RoomContext";
import ToastProvider from "../shared/components/ui/ToastProvider";

export default function Providers({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <SocketProvider>
          <GameProvider>
            <RoomProvider>{children}</RoomProvider>
          </GameProvider>
        </SocketProvider>
      </AuthProvider>
    </ToastProvider>
  );
}