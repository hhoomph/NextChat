import mongoose, { Model, Document } from "mongoose";
import { OnlineType } from "../types/Types";
type OnlineDoc = OnlineType & Document;
export interface OnlineDocument extends OnlineDoc {}
export interface OnlineModel extends Model<OnlineDocument> {
  logOnline: (username: string | undefined, socketId: string) => Promise<OnlineType>;
  logOffLine(socketId: string): Promise<any>;
  deleteOnline(username: string | undefined): Promise<any>;
  findUserByUsername(u: string | undefined): Promise<any>;
  findUserBySocketId: (socketId: string) => Promise<OnlineType>;
  logOffAll: () => Promise<any>;
  updateSocket: (username: string | undefined, id: string) => Promise<any>;
  checkOnline: (username: string) => Promise<OnlineType>;
}
const OnlineSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    socketId: { type: String, required: true, unique: true },
  },
  { collection: "online" }
);
OnlineSchema.statics.logOnline = async function (username: string, socketId: string) {
  try {
    const result = await this.create({ username, socketId });
    return result;
  } catch (error) {
    //console.log(error);
  }
};
OnlineSchema.statics.logOffLine = async function (socketId: string) {
  try {
    const result = await this.deleteOne({ socketId: socketId });
    return result;
  } catch (error) {
    // throw error;
  }
};
OnlineSchema.statics.deleteOnline = async function (username: string) {
  try {
    const result = await this.deleteOne({ username: username });
    return result;
  } catch (error) {
    // throw error;
  }
};
OnlineSchema.statics.findUserByUsername = async function (usr: string) {
  try {
    let query = {
      $or: [{ username: { $regex: usr, $options: "i" } }],
    };
    const user = await this.findOne(query);
    return user;
  } catch (error) {
    // throw error;
  }
};
OnlineSchema.statics.findUserBySocketId = async function (socketId: string) {
  try {
    const users = await this.findOne({ socketId: socketId });
    return users;
  } catch (error) {
    throw error;
  }
};
OnlineSchema.statics.logOffAll = async function () {
  try {
    const result = await this.deleteMany({});
    return result;
  } catch (error) {
    throw error;
  }
};
OnlineSchema.statics.updateSocket = async function (username, socketId) {
  try {
    const request = await this.findOneAndUpdate(
      {
        username: { $regex: "^" + username + "$", $options: "i" },
      },
      {
        $set: {
          socketId: socketId,
        },
      },
      { upsert: false, useFindAndModify: false }
    );
    if (request) {
      return {
        message: "ok",
      };
    } else {
      return {
        message: "error id not found",
      };
    }
  } catch (error) {
    console.log("Conversation's acceptRequest", error);
    ///throw error;
  }
};
OnlineSchema.statics.checkOnline = async function (username: string) {
  try {
    const users = await this.findOne({ username: username });
    return users;
  } catch (error) {
    throw error;
  }
};
export default mongoose.models.OnlineSchema
  ? (mongoose.models.OnlineSchema as OnlineModel)
  : mongoose.model<OnlineDocument, OnlineModel>("OnlineSchema", OnlineSchema);