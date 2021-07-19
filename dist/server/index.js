"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const path_1 = require("path");
const cors_1 = __importDefault(require("cors"));
const next_1 = __importDefault(require("next"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const socket_io_1 = require("socket.io");
// import { ObjectID } from "mongodb";
// import { MongoClient, ObjectID } from "mongodb";
// import UserModel from "../model/user";
const online_1 = __importDefault(require("../model/online"));
const message_1 = __importDefault(require("../model/message"));
// import connectDB from "../database/mongo";
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next_1.default({ dev });
const handle = app.getRequestHandler();
const expressApp = express_1.default();
const baseUrl = process.env.NODE_ENV !== "production"
    ? "http://localhost:".replace(/^http/, "ws") + port
    : "https://nextchatapp.herokuapp.com:".replace(/^http/, "ws") + port;
const SECRET = process.env.SECRET || "a92955bcf0e92b1deaea647e706bbc9f";
const socketOption = {
    maxHttpBufferSize: 5 * 1024 * 1024,
    allowEIO3: true,
    serveClient: true,
    cors: {
        origin: baseUrl,
        methods: ["GET", "POST"],
        credentials: true,
    },
};
app
    .prepare()
    .then(() => {
    const httpServer = http_1.default.createServer(expressApp);
    // To remove data, use:
    expressApp.use(express_mongo_sanitize_1.default());
    expressApp.use(cors_1.default());
    expressApp.get("*", (req, res) => {
        const parsedUrl = url_1.parse(req.url, true);
        const { pathname } = parsedUrl;
        // return handle(req, res, parsedUrl);
        if ((pathname !== null && pathname === "/sw.js") || (pathname !== null && /^\/(workbox|worker|fallback)-\w+\.js$/.test(pathname))) {
            const filePath = path_1.join(__dirname, ".next", pathname);
            app.serveStatic(req, res, filePath);
        }
        else {
            return handle(req, res, parsedUrl);
        }
    });
    expressApp.post("*", (req, res) => {
        return handle(req, res);
    });
    expressApp.all("*", (req, res) => {
        return handle(req, res);
    });
    // Socket Code
    let connectedPeers = [];
    const io = new socket_io_1.Server(httpServer, socketOption);
    io.use(function (socket, next) {
        if (socket.handshake.query && socket.handshake.query.token) {
            jsonwebtoken_1.default.verify(socket.handshake.query.token.toString(), SECRET, function (err, decoded) {
                if (err)
                    return next(new Error("Authentication error"));
                if (decoded === null || decoded === void 0 ? void 0 : decoded.user) {
                    decoded.user.ID = socket.id;
                }
                socket.user = decoded === null || decoded === void 0 ? void 0 : decoded.user;
                next();
            });
        }
        else {
            next(new Error("Authentication error"));
        }
    });
    io.on("connection", async (socket) => {
        connectedPeers.push(socket.id.toString());
        io.emit("connected", socket.user);
        socket.on("initUser", async () => {
            var _a, _b, _c;
            // const userId = new ObjectID(socket.user?._id);
            const newId = socket.id.toString();
            try {
                // Change User.ID Set new socket id
                // await UserModel.updateUserID(userId, newId);
                const isOnline = await online_1.default.findUserByUsername((_a = socket.user) === null || _a === void 0 ? void 0 : _a.username);
                if (isOnline && isOnline != undefined && isOnline != null && (isOnline === null || isOnline === void 0 ? void 0 : isOnline.username)) {
                    // Update socketId for online user
                    await online_1.default.updateSocket((_b = socket.user) === null || _b === void 0 ? void 0 : _b.username, newId);
                    io.socketsJoin(socket.id);
                }
                else {
                    // Add user to online collection
                    await online_1.default.logOnline((_c = socket.user) === null || _c === void 0 ? void 0 : _c.username, newId);
                    io.socketsJoin(socket.id);
                }
                io.emit("connected", socket.user);
                console.log("New User Logged In with ID " + newId);
            }
            catch (e) {
                console.log(e);
            }
        });
        // client.close();
        socket.on("chat_message", async (data) => {
            let twoUsr = data.sender + "," + data.receiver;
            let array = twoUsr.split(",").sort();
            const conversationId = `${array[0]}_${array[1]}`;
            const createdAt = new Date().getTime();
            try {
                const res = await message_1.default.postMessage({
                    sender: data.sender,
                    receiver: data.receiver,
                    content: data.content,
                    conversationId: conversationId,
                    createdAt: createdAt,
                    read: false,
                });
                if (res) {
                    // io.sockets.to(socket.id).emit("new_message", res);
                    // io.to(socket.id).emit("new_message", res);
                    //socket.broadcast.to(socket.id).emit("willInitiateCall", res);
                    // io.in(socket.id).emit("new_message", res);
                    const result2 = await online_1.default.findUserByUsername(data.receiver);
                    if (result2 && result2.socketId) {
                        io.sockets.to(socket.id).to(result2.socketId).emit("new_message", res);
                        // io.to(result2[0].socketId).emit("new_message", res);
                        //socket.broadcast.to(result2[0].socketId).emit("willInitiateCall", res);
                        // io.in(result2[0].socketId).emit("new_message", res);
                    }
                    else {
                        io.sockets.to(socket.id).emit("new_message", res);
                    }
                    // io.to(result2.socketId).emit("new_message", res);
                    // socket.to(socket.id).emit("new_message", res);
                    // io.to(socket.id).to(result2[0].socketId).emit("new_message", res);
                }
            }
            catch (e) {
                console.log(e);
            }
        });
        socket.on("read_message", async (data) => {
            let id = data._id;
            try {
                const res = await message_1.default.updateRead(id);
                if (res) {
                    io.emit("message_readed", res.res);
                }
            }
            catch (e) {
                console.log(e);
            }
        });
        socket.on("disconnect", async () => {
            var _a;
            try {
                console.log("disconnected :", socket.id);
                // Delete User From Online Collection
                await online_1.default.deleteOnline((_a = socket.user) === null || _a === void 0 ? void 0 : _a.username);
                socket.removeAllListeners();
                const newConnectedPeers = connectedPeers.filter((peerSocketId) => {
                    peerSocketId !== socket.id;
                });
                connectedPeers = newConnectedPeers;
                io.socketsLeave(socket.id);
                io.emit("disconnected", socket.user);
            }
            catch (e) {
                console.log(e);
            }
        });
    });
    httpServer.listen(port, (err) => {
        if (err)
            throw err;
        console.log(`> Server listening at http://localhost:${port} as ${dev ? "development" : process.env.NODE_ENV}`);
    });
})
    .catch((exception) => {
    console.error(exception.stack);
    process.exit(1);
});
//# sourceMappingURL=index.js.map