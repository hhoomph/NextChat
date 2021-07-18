export interface User {
  _id: string;
  username: string;
  password?: string | undefined;
  createdAt: number;
  ID?: string;
  messageCount?: number;
}
export type Maybe<T> = T | null | undefined;
export type MessageType = {
  _id?: string;
  content: string;
  sender: string | undefined;
  receiver: string;
  createdAt?: number | string;
  conversationId?: string;
  read?: boolean;
};
export type OnlineType = {
  _id: string;
  username: string;
  socketId: string;
};