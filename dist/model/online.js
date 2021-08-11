"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const OnlineSchema = new mongoose_1.default.Schema({
    username: { type: String, required: true, unique: true },
    socketId: { type: String, required: true, unique: true },
}, { collection: "online" });
OnlineSchema.statics.logOnline = async function (username, socketId) {
    try {
        const result = await this.create({ username, socketId });
        return result;
    }
    catch (error) {
        //console.log(error);
    }
};
OnlineSchema.statics.logOffLine = async function (socketId) {
    try {
        const result = await this.deleteOne({ socketId: socketId });
        return result;
    }
    catch (error) {
        // throw error;
    }
};
OnlineSchema.statics.deleteOnline = async function (username) {
    try {
        const result = await this.deleteOne({ username: username });
        return result;
    }
    catch (error) {
        // throw error;
    }
};
OnlineSchema.statics.findUserByUsername = async function (usr) {
    try {
        let query = {
            $or: [{ username: { $regex: usr, $options: "i" } }],
        };
        const user = await this.findOne(query);
        return user;
    }
    catch (error) {
        // throw error;
    }
};
OnlineSchema.statics.findUserBySocketId = async function (socketId) {
    try {
        const users = await this.findOne({ socketId: socketId });
        return users;
    }
    catch (error) {
        throw error;
    }
};
OnlineSchema.statics.logOffAll = async function () {
    try {
        const result = await this.deleteMany({});
        return result;
    }
    catch (error) {
        throw error;
    }
};
OnlineSchema.statics.updateSocket = async function (username, socketId) {
    try {
        const request = await this.findOneAndUpdate({
            username: { $regex: "^" + username + "$", $options: "i" },
        }, {
            $set: {
                socketId: socketId,
            },
        }, { upsert: false, useFindAndModify: false });
        if (request) {
            return {
                message: "ok",
            };
        }
        else {
            return {
                message: "error id not found",
            };
        }
    }
    catch (error) {
        console.log("Conversation's acceptRequest", error);
        ///throw error;
    }
};
OnlineSchema.statics.checkOnline = async function (username) {
    try {
        const users = await this.findOne({ username: username });
        return users;
    }
    catch (error) {
        throw error;
    }
};
exports.default = mongoose_1.default.models.OnlineSchema
    ? mongoose_1.default.models.OnlineSchema
    : mongoose_1.default.model("OnlineSchema", OnlineSchema);
//# sourceMappingURL=online.js.map