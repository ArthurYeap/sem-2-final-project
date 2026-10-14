// ? socket connection to the backend server
import { io } from "socket.io-client";

const socket = io("http://192.168.2.107:5000", {
    transports: ["websocket"]
});

export default socket;