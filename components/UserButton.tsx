import React, { FC, useEffect, useState, useCallback } from "react";
import { useReceiver } from "./../contexts/ReceiverContext";
import fetchData from "utils/fetchData";
// import { useSocketIo } from "../contexts/SocketIoContext";
// import { useSocket } from "../contexts/SocketContext";
import { User, MessageType } from "../types/Types";
import { Socket } from "socket.io-client";
import jsCookie from "js-cookie";
const token = jsCookie.get("token");
// import Image from "next/image";
const defaultUser = {
  _id: "",
  username: "",
  createdAt: 0,
};
interface Props {
  user: User | undefined;
  newMsg: MessageType | null;
  toggleNeMsg: () => void;
  socket: Socket;
  onClick?: any;
}
const UserButton: FC<Props> = ({ user = defaultUser, newMsg, toggleNeMsg, socket }: Props) => {
  const { receiverUser, setReceiverUser } = useReceiver();
  const [isOnline, setIsOnline] = useState(false);
  // const [messageCount, setMessageCount] = useState<number | undefined>(user.messageCount);
  const handleUserClick = (usr: User) => {
    setReceiverUser(usr);
    user.messageCount = undefined;
    if (newMsg?.sender == user.username) {
      toggleNeMsg();
    }
  };
  const checkOnline = useCallback(async () => {
    const res = await fetchData(
      "/api/users/online",
      {
        method: "POST",
        body: JSON.stringify({
          username: user.username,
        }),
      },
      token
    );
    if (res && res.online != undefined) {
      setIsOnline(res.online);
    }
  }, [user]);
  // const [socket] = useSocket();
  // const socket = useContext(SocketContext);
  // const iniSocket = socketIo(baseUrl, {
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
  // const [socket, setSocket] = useState<Socket>(iniSocket);
  // useEffect(() => {
  //   if (socket) {
  //     socket.open();
  //     socket.connect();
  //     socket.emit("initUser");
  //   }
  //   setSocket(socket);
  //   if (socket?.connected) {
  //     return () => {
  //       socket.close();
  //       socket.disconnect();
  //     };
  //   }
  // }, [socket]);
  useEffect(() => {
    socket?.on("disconnected", () => {
      checkOnline();
    });
    socket?.on("connected", () => {
      checkOnline();
    });
    socket?.on("disconnect", () => {
      checkOnline();
    });
    socket?.on("connect", () => {
      checkOnline();
    });
  }, [checkOnline, socket, user]);
  useEffect(() => {
    checkOnline();
    return () => {
      setIsOnline(false); // This worked for me
    };
  }, [user, receiverUser, checkOnline]);
  const active = receiverUser.username == user.username ? " active" : "";
  return (
    <button type="button" className={"btn user_btn position-relative mb-3" + active} onClick={() => handleUserClick(user)}>
      {user?.username}
      {isOnline ? (
        <span className="position-absolute top-0 start-100 translate-middle p-2 bg-success border border-light rounded-circle">
          <span className="visually-hidden">New alerts</span>
        </span>
      ) : (
        <span className="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle">
          <span className="visually-hidden">New alerts</span>
        </span>
      )}
      {receiverUser.username != user.username && user.messageCount && user.messageCount > 0 && (
        <span className="badge rounded-pill bg-warning text-dark">{user.messageCount}</span>
      )}
    </button>
  );
};
export default UserButton;