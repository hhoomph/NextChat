import mongoose, { Model, Document } from "mongoose";
// import connectDB from "../database/mongo";
import { User } from "../types/Types";
type UserDoc = User & Document;
export interface UserDocument extends UserDoc {}
export interface UserModel extends Model<UserDocument> {
  createUser: (u: string, p: string) => Promise<User>;
  findUser(u: string): Promise<any>;
  findByUsername(u: string): Promise<any>;
  findSearch(u: string): Promise<User[]>;
  updateUserID: (_id: any, ID: string) => Promise<any>;
  getUsersOfMessages: (users: string[]) => Promise<User[]>;
}
const UserSchema = new mongoose.Schema<UserDocument>(
  {
    // _id: { type: mongoose.Schema.Types.ObjectId, default: new mongoose.Types.ObjectId(), index: true, required: true, auto: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    ID: { type: String, required: false },
    createdAt: { type: Number, default: new Date().getTime() },
  },
  { collection: "users" }
);
UserSchema.statics.createUser = async function (username: string, password: string) {
  try {
    const user = await this.create({ username, password });
    return user;
  } catch (error) {
    throw error;
  }
  // connectDB().then(async (mongoose) => {
  //   try {
  //     const user = await this.create({ username, password });
  //     return user;
  //   } finally {
  //     mongoose.connection.close();
  //   }
  // });
};
UserSchema.statics.findUser = async function (username: string) {
  try {
    const user = await this.findOne({ username: username });
    return user;
  } catch (error) {
    //throw error;
  }
  // connectDB().then(async (mongoose) => {
  //   try {
  //     const user = await this.findOne({ username: username });
  //     return user;
  //   } finally {
  //     mongoose.connection.close();
  //   }
  // });
};
UserSchema.statics.findByUsername = async function (username: string) {
  try {
    const user = await this.findOne({ username: username }, { password: 0 });
    return user;
  } catch (error) {
    //throw error;
  }
};
UserSchema.statics.findSearch = async function (q: string) {
  try {
    let query = {
      $or: [{ username: { $regex: q, $options: "i" } }],
    };
    const user = await this.find(query, { password: 0 });
    return user;
  } catch (error) {
    //throw error;
  }
  // connectDB().then(async (mongoose) => {
  //   try {
  //     let query = {
  //       $or: [{ username: { $regex: q, $options: "i" } }],
  //     };
  //     const user = await this.find(query);
  //     return user;
  //     console.log(user);
  //   } finally {
  //     mongoose.connection.close();
  //   }
  // });
};
UserSchema.statics.updateUserID = async function (_id: any, ID: string) {
  try {
    const request = await this.findOneAndUpdate(
      {
        _id: _id,
      },
      {
        ID: ID,
      },
      { upsert: true, useFindAndModify: false }
    );
    if (request) {
      return {
        message: "ok",
        _id: request._id,
        ID: request.ID,
        username: request.username,
      };
    } else {
      return {
        message: "error _id not found",
        id: _id,
      };
    }
  } catch (error) {
    console.log("Conversation's acceptRequest", error);
    //throw error;
  }
  // connectDB().then(async (mongoose) => {
  //   try {
  //     const request = await this.findOneAndUpdate(
  //       {
  //         _id: _id,
  //       },
  //       {
  //         ID: ID,
  //       },
  //       { upsert: true, useFindAndModify: false }
  //     );
  //     if (request) {
  //       return {
  //         message: "ok",
  //         _id: request._id,
  //         ID: request.ID,
  //         username: request.username,
  //       };
  //     } else {
  //       return {
  //         message: "error _id not found",
  //         id: _id,
  //       };
  //     }
  //   } finally {
  //     mongoose.connection.close();
  //   }
  // });
};
UserSchema.statics.getUsersOfMessages = async function (users: string[]) {
  try {
    let query: any = { username: { $in: users } };
    const res: User[] = await this.find(query, { password: 0 });
    return res;
  } catch (error) {
    //throw error;
  }
};
export default mongoose.models.UserSchema ? (mongoose.models.UserSchema as UserModel) : mongoose.model<UserDocument, UserModel>("UserSchema", UserSchema);