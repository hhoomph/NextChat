import React, { FC } from "react";
import { User, MessageType } from "../types/Types";
import Image from "next/image";
interface Props {
  user: User | undefined;
  message: MessageType;
}
const defaultUser = {
  _id: "",
  username: "",
  createdAt: 0,
};
const Message: FC<Props> = ({ user = defaultUser, message }: Props) => {
  let _class = user.username === message.sender ? " message_me " : " message_from ";
  let date = message?.createdAt ? new Date(message?.createdAt) : new Date();
  return (
    <div className={"card mb-2 border-warning" + _class}>
      <div className="card-header">{message.sender}</div>
      <div className="card-body">{message.content}</div>
      <footer className="blockquote-footer mt-1">
        {user.username === message.sender && (
          <div className="readed_wrapper">
            {message.read ? (
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