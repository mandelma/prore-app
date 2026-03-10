import { io } from "socket.io-client";

console.log("Socket URL:", import.meta.env.VITE_SOCKET_URL);

const URL = import.meta.env.VITE_SOCKET_URL;


let token;
const raw = localStorage.getItem('loggedAppUser');
if (raw) {
    const appUser = JSON.parse(raw);
    token = appUser.token;
}



const socket = io(URL, {
    auth: { token },
    forceNew: true,
    reconnectionAttempts: Infinity,
    timeout: 10000,
    transports: ["websocket"]
});


socket.onAny((event, ...args) => {
    console.log(event, args);
});

socket.on("connect", () => {
    console.log("socket connected", socket.id);
});

socket.on("connect_error", (err) => {
    console.log("socket connect_error:", err.message);
    console.log("details:", err);
});

socket.on("disconnect", (reason) => {
    console.log("socket disconnected:", reason);
});

socket.onAny((event, ...args) => {
    console.log("socket event:", event, args);
});


export default socket;