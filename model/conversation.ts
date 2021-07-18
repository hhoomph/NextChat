import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
// Can be changed to make it to multiple user chat
function arrayLimit(val:Array<string>) {
  return val.length === 2;
}
function returnResult(stat:string, msg:string, id:string, username?:string, time?:number) {
  return {
    status: stat,
    message: msg,
    conversationId: id,
    user: username,
    createdAt: time,
  };
}
const ConversationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4().replace("-", ""),
    },
    userIds: {
      type: [{ type: String }],
      validate: [arrayLimit, `Conversation with two user`],
    },
    creator: { type: String },
    status: {
      type: String,
      enum: ["accept", "pending"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    collection: "conversations",
  }
);
ConversationSchema.statics.sendRequest = async function (creator, receivor) {
  try {
    const exist = await this.findOne({
      userIds: {
        $all: [creator, receivor],
      },
    });
    if (exist) {
      if (exist.status === "accept") {
        return returnResult("duplicate", "conversation already exist", exist._id);
      } else {
        return returnResult("duplicate", "request already sent", exist._id);
      }
    }
    const newCon = await this.create({
      userIds: [creator, receivor],
      creator: creator,
    });
    return returnResult("ok", "new conversation created", newCon._id, "", newCon.createdAt);
  } catch (error) {
    console.log("Conversation's sendRequest", error);
    throw error;
  }
};
ConversationSchema.statics.acceptRequest = async function (id, receiver) {
  try {
    const request = await this.findOneAndUpdate(
      {
        _id: id,
        userIds: { $in: [receiver] },
      },
      {
        status: "accept",
      }
    );
    if (request) {
      return returnResult("ok", "request accepted", id, request.creator, request.createdAt);
    } else {
      return returnResult("error", "request unfound", id);
    }
  } catch (error) {
    console.log("Conversation's acceptRequest", error);
    throw error;
  }
};
ConversationSchema.statics.getConversationsByUsername = async function (username) {
  try {
    const result = await this.find({
      userIds: { $in: [username] },
    }).lean();
    return result;
  } catch (error) {
    console.log("Conversation's getConversationsByUsername", error);
    throw error;
  }
};
ConversationSchema.statics.getConversationById = async function (id) {
  try {
    const result = await this.findOne({
      _id: id,
    });
    return result;
  } catch (error) {
    console.log("Conversation's getConversationById", error);
    throw error;
  }
};
ConversationSchema.statics.deleteConversation = async function (id, username) {
  try {
    const request = await this.findOneAndDelete({
      _id: id,
      userIds: { $in: [username] },
    });
    if (request) {
      const user = username === request.userIds[0] ? request.userIds[1] : request.userIds[0];
      return returnResult("ok", "request deleted", id, user);
    } else {
      return returnResult("error", "request delete failed", id);
    }
  } catch (error) {
    console.log("Conversation's deleteConversation", error);
    throw error;
  }
};
const model = mongoose.model("ConversationSchema", ConversationSchema);
module.exports = model;