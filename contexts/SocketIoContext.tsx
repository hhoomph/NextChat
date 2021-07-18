import React, { useContext, useEffect } from "react";
import { io as socketIo, Socket } from "socket.io-client";
import { ReservedOrUserListener } from "socket.io-client/build/typed-events";
import jsCookie from "js-cookie";
const SocketIoContext = React.createContext<Socket>({} as Socket);
type SocketIoProviderProps = React.PropsWithChildren<{}>;
const token = jsCookie.get("token");
const port = parseInt(process.env.PORT || "3000", 10);
const baseUrl = "http://localhost:" + port;
const initializedSocket = socketIo(baseUrl, {
  withCredentials: true,
  query: token ? { token } : undefined,
  autoConnect: true,
  multiplex: false,
  reconnection: true,
});
export function useSocketIo() {
  return useContext(SocketIoContext);
}
export function useSocketListener(event: string, fn: ReservedOrUserListener<any, any, any>) {
  const socket = useSocketIo();
  useEffect(() => {
    socket.on(event, fn);
    return () => {
      socket.off(event, fn);
    };
  }, [event, fn, socket]);
}
// Please note that since Socket.IO v3, the Socket instance does not emit any event related
// to the reconnection logic anymore. You can listen to the events on the Manager instance directly:
// https://socket.io/docs/v3/client-socket-instance/
export function useSocketManagerListener(event: any, fn: ReservedOrUserListener<any, any, any>) {
  const socket = useSocketIo();
  useEffect(() => {
    socket.io.on(event, fn);
    return () => {
      socket.io.off(event, fn);
    };
  }, [event, fn, socket]);
}
function SocketIoProvider({ children }: SocketIoProviderProps) {
  useEffect(() => {
    return () => {
      initializedSocket.disconnect();
    };
  }, []);
  return <SocketIoContext.Provider value={initializedSocket}>{children}</SocketIoContext.Provider>;
}
export default SocketIoProvider;