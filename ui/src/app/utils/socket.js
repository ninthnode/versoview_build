import { io } from "socket.io-client";

let socket = null;

export const initializeSocket = (userId) => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL);
    socket.emit("register", userId);
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not initialized. Call initializeSocket first.");
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
