/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";

const RoomContext = createContext();

export function RoomProvider({ children }) {
  const [room, setRoom] = useState(null);

  return (
    <RoomContext.Provider
      value={{
        room,
        setRoom,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export const useRoom = () => useContext(RoomContext);
