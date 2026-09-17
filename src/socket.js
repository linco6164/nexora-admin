import { io } from "socket.io-client";

const SOCKET_URL = "https://api.nx-store.com";

let socket = null;

export function connectSocket(token) {
  if (!token) {
    console.error(
      "SOCKET: admin_token lipsă",
    );

    return null;
  }

  if (socket) {
    socket.auth = {
      token,
    };

    if (!socket.connected) {
      socket.connect();
    }

    return socket;
  }

  console.log(
    "SOCKET URL:",
    SOCKET_URL,
  );

  socket = io(SOCKET_URL, {
    transports: ["websocket"],

    auth: {
      token,
    },

    autoConnect: true,

    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log(
      "✅ SOCKET CONNECTED:",
      socket.id,
    );

    socket.emit(
      "support:admin:join",
    );
  });

  socket.on(
    "connect_error",
    (error) => {
      console.error(
        "❌ SOCKET CONNECT ERROR:",
        error.message,
      );

      console.error(
        "SOCKET ERROR:",
        error,
      );
    },
  );

  socket.on(
    "disconnect",
    (reason) => {
      console.warn(
        "⚠️ SOCKET DISCONNECTED:",
        reason,
      );
    },
  );

  socket.on(
    "support:error",
    (data) => {
      console.error(
        "❌ SUPPORT SOCKET ERROR:",
        data,
      );
    },
  );

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (!socket) {
    return;
  }

  socket.emit(
    "support:admin:leave",
  );

  socket.disconnect();

  socket = null;
}