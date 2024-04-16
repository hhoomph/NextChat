/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { io as socketIo, Socket } from "socket.io-client";
import jsCookie from "js-cookie";
const token = jsCookie.get("token");
const port = parseInt(process.env.PORT || "3000", 10);
const baseUrl = process.env.NODE_ENV !== "production" ? "http://localhost:" + port : "https://nextchatapp.herokuapp.com".replace(/^http/, "ws");
// export const socket = socketIo(baseUrl, {
//   withCredentials: true,
//   query: token ? { token } : undefined,
//   autoConnect: false,
//   multiplex: false,
//   transports: ["websocket"],
//   upgrade: false,
//   jsonp: false,
//   reconnection: true,
//   reconnectionDelay: 500,
// });
export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    setSocket(
      socketIo(baseUrl, {
        withCredentials: true,
        query: token ? { token } : undefined,
        autoConnect: false,
        multiplex: false,
        transports: ["websocket"],
        upgrade: false,
        // jsonp: false,
        reconnection: true,
        reconnectionDelay: 500,
      }).connect()
    );
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);
  return [socket];
};