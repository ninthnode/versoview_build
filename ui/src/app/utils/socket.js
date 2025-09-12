import { io } from "socket.io-client";

let socket = null;
let isRegistered = false;

export const initializeSocket = (userId) => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL);
    console.log("Socket: New socket connection created");
  }
  
  // Only register once per userId
  if (!isRegistered && userId) {
    socket.emit("register", userId);
    console.log("Socket: Registered user:", userId);
    isRegistered = true;
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
    console.log("Socket: Disconnecting socket");
    socket.disconnect();
    socket = null;
    isRegistered = false;
  }
};
