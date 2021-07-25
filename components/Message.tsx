/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from "react";
import { User, MessageType } from "../types/Types";
import Image from "next/image";
// import { useSocketIo, useSocketListener } from "../contexts/SocketIoContext";
//  import { useSocket } from "../contexts/SocketContext";
import { useUser } from "../contexts/UserContext";
import { Socket } from "socket.io-client";
interface Props {
  user: User | undefined;
  message: MessageType;
  socket: Socket;
}
const defaultUser = {
  _id: "",
  username: "",
  createdAt: 0,
};
const Message: FC<Props> = ({ user = defaultUser, message, socket }: Props) => {
  const [read, setRead] = useState<boolean | undefined>(message.read);
  let _class = user.username === message.sender ? " message_me " : " message_from ";
  let date = message?.createdAt ? new Date(message?.createdAt) : new Date();
  const { currentUser } = useUser();
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
  //   socket.connect();
  //   socket.emit("initUser");
  //   setSocket(socket);
  //   if (socket.connected) {
  //     return () => {
  //       socket.close();
  //       socket.disconnect();
  //     };
  //   }
  // }, [socket]);
  useEffect(() => {
    if (currentUser.username == message.receiver) {
      socket?.emit("read_message", message);
    }
  }, []);
  useEffect(() => {
    socket?.on("message_readed", (res: MessageType) => {
      if (res._id == message._id) {
        setRead(true);
      }
    });
  }, []);
  // useSocketListener("message_readed", (res: MessageType) => {
  //   if (res._id == message._id) {
  //     setRead(true);
  //   }
  // });
  return (
    <div className={"card mb-2 border-secondary" + _class}>
      <div className="card-header">{message.sender}</div>
      <div className="card-body">{message.content}</div>
      <footer className="blockquote-footer mt-1">
        {user.username === message.sender && (
          <div className="readed_wrapper">
            {read ? (
              <Image src="/icons/check-all.svg" alt="پاک کردن تاریخچه پیام ها" width={24} height={24} className="btn btn-small" />
            ) : (
              <Image src="/icons/check.svg" alt="پاک کردن تاریخچه پیام ها" width={24} height={24} className="btn btn-small" />
            )}
          </div>
        )}
        {date?.toLocaleTimeString()}
      </footer>
    </div>
  );
};
export default Message;