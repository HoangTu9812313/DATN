import { io } from "socket.io-client";

// ================= SERVER URL =================
const SERVER_URL =
  process.env.REACT_APP_SOCKET_URL ||
  "https://football-bk.onrender.com";

// ================= SINGLETON =================
let socket;

if (!socket) {
  socket = io(SERVER_URL, {
    transports: ["websocket"],
    autoConnect: true,
    forceNew: false,

    // ===== reconnect giống Flutter =====
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  // ================= CONNECT =================
  socket.on("connect", () => {
    console.log("✅ SOCKET CONNECTED:", socket.id);
  });

  // ================= DISCONNECT =================
  socket.on("disconnect", (reason) => {
    console.log("❌ SOCKET DISCONNECTED:", reason);
  });

  // ================= RECONNECT =================
  socket.io.on("reconnect", (attempt) => {
    console.log("🔄 SOCKET RECONNECTED:", attempt);
  });

  // ================= ERROR =================
  socket.on("connect_error", (err) => {
    console.log("❌ CONNECT ERROR:", err.message);
  });

  socket.on("error", (err) => {
    console.log("❌ SOCKET ERROR:", err);
  });

  // ================= DEBUG ALL EVENTS =================
  socket.onAny((event, data) => {
    console.log(`📡 EVENT => ${event}`, data);
  });
}

// ================= EXPORT =================
export default socket;