import mongoose, { Model, Document } from "mongoose";
import { MessageType } from "../types/Types";
type MessageDoc = MessageType & Document;
export interface MessageDocument extends MessageDoc {}
export interface MessageModel extends Model<MessageDocument> {
  postMessage(m: MessageType): Promise<MessageType[]>;
  getMessagesById(id: string): Promise<MessageType[]>;
  deleteMessagesById(id: string): Promise<any>;
  updateRead(id: string | undefined): Promise<any>;
  gettMessageUsers(u: string): Promise<any>;
}
const MessageSchema = new mongoose.Schema<MessageType>(
  {
    sender: { type: String, required: true },
    receiver: { type: String, require: true },
    content: { type: String, minlength: 1, maxlength: 400 },
    conversationId: { type: String, require: true },
    createdAt: { type: Number, default: new Date().getTime() },
    read: { type: Boolean },
  },
  {
    collection: "message",
  }
);
MessageSchema.statics.postMessage = async function ({ sender, receiver, content, conversationId, createdAt, read }: MessageType) {
  try {
    const result = await this.create({ sender, receiver, content, conversationId, createdAt, read });
    return result;
  } catch (error) {
    throw error;
  }
};
MessageSchema.statics.getMessagesById = async function (id) {
  try {
    const result = await this.aggregate([{ $match: { conversationId: id } }, { $sort: { createdAt: 1 } }]);
    return result;
  } catch (error) {
    throw error;
  }
};
MessageSchema.statics.deleteMessagesById = async function (id) {
  try {
    const result = await this.deleteMany({ conversationId: id });
    return result;
  } catch (error) {
    throw error;
  }
};
MessageSchema.statics.updateRead = async function (id) {
  try {
    const request = await this.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          read: true,
        },
      },
      { upsert: false, useFindAndModify: false }
    );
    if (request) {
      return {
        message: "ok",
        res:request
      };
    } else {
      return {
        message: "error id not found",
      };
    }
  } catch (error) {
    console.log("Conversation's acceptRequest", error);
    throw error;
  }
};
MessageSchema.statics.gettMessageUsers = async function (username: string) {
  try {
    const result = await this.find({ $or: [{ sender: username }, { receiver: username }] }, { projection: { _id: 0 } });
    return result;
  } catch (error) {
    throw error;
  }
};
export default mongoose.models.MessageSchema
  ? (mongoose.models.MessageSchema as MessageModel)
  : mongoose.model<MessageDocument, MessageModel>("MessageSchema", MessageSchema);