import { socket } from "../../../shared/services/socket/socket";

export const createRoom = (payload, callback) => {
  socket.emit("room:create", payload, callback);
};

export const joinRoom = (payload, callback) => {
  socket.emit("room:join", payload, callback);
};

export const leaveRoom = (payload) => {
  socket.emit("room:leave", payload);
};

export const startGame = (payload) => {
  socket.emit("room:start", payload);
};