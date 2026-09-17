// src/api/supportSocket.js

import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

let socket = null;

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    ""
  );
}

export function connectSupportSocket() {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    auth: {
      token: getToken(),
    },
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log(
      "[SUPPORT SOCKET] connected:",
      socket.id,
    );
  });

  socket.on("connect_error", (error) => {
    console.error(
      "[SUPPORT SOCKET] connection error:",
      error.message,
    );
  });

  socket.on("disconnect", (reason) => {
    console.log(
      "[SUPPORT SOCKET] disconnected:",
      reason,
    );
  });

  return socket;
}

export function getSupportSocket() {
  return socket;
}

export function disconnectSupportSocket() {
  if (!socket) return;

  socket.disconnect();
  socket = null;
}