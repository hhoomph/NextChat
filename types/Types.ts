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
// WebRTC Types
export interface ConnectedUserDetail {
  socketId: string | undefined;
  callType: String | undefined;
}
type FacingMode = { exact: string };
type Video = {
  facingMode: string | FacingMode;
};
type Size = {
  width: number;
  height: number;
};
type FrameRate = {
  max?: number;
  min?: number;
};
type Width = {
  min?: number;
  ideal?: number;
  max?: number;
};
type Height = {
  min?: number;
  ideal?: number;
  max?: number;
};
export type Constraints = {
  audio: boolean;
  video: Video | boolean | Size;
  frameRate?: FrameRate;
  aspectRatio?: number;
  width?: Width | number;
  height?: Height | number;
  echoCancellation?: boolean;
};
// export interface IJwtPayload extends JwtPayload {
//   user?: User;
// }