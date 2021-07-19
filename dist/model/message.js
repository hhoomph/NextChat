"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MessageSchema = new mongoose_1.default.Schema({
    sender: { type: String, required: true },
    receiver: { type: String, require: true },
    content: { type: String, minlength: 1, maxlength: 400 },
    conversationId: { type: String, require: true },
    createdAt: { type: Number, default: new Date().getTime() },
    read: { type: Boolean },
}, {
    collection: "message",
});
MessageSchema.statics.postMessage = async function ({ sender, receiver, content, conversationId, createdAt, read }) {
    try {
        const result = await this.create({ sender, receiver, content, conversationId, createdAt, read });
        return result;
    }
    catch (error) {
        throw error;
    }
};
MessageSchema.statics.getMessagesById = async function (id) {
    try {
        const result = await this.aggregate([{ $match: { conversationId: id } }, { $sort: { createdAt: 1 } }]);
        return result;
    }
    catch (error) {
        throw error;
    }
};
MessageSchema.statics.deleteMessagesById = async function (id) {
    try {
        const result = await this.deleteMany({ conversationId: id });
        return result;
    }
    catch (error) {
        throw error;
    }
};
MessageSchema.statics.updateRead = async function (id) {
    try {
        const request = await this.findOneAndUpdate({
            _id: id,
        }, {
            $set: {
                read: true,
            },
        }, { upsert: false, useFindAndModify: false });
        if (request) {
            return {
                message: "ok",
                res: request
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
        throw error;
    }
};
MessageSchema.statics.gettMessageUsers = async function (username) {
    try {
        const result = await this.find({ $or: [{ sender: username }, { receiver: username }] }, { projection: { _id: 0 } });
        return result;
    }
    catch (error) {
        throw error;
    }
};
exports.default = mongoose_1.default.models.MessageSchema
    ? mongoose_1.default.models.MessageSchema
    : mongoose_1.default.model("MessageSchema", MessageSchema);
//# sourceMappingURL=message.js.map