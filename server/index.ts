import { parse } from "url";
import { join } from "path";
import cors from "cors";
import next from "next";
import express, { Request, Response } from "express";
import http from "http";
import mongoSanitize from "express-mongo-sanitize";
import { Server, Socket } from "socket.io";
// import { ObjectID } from "mongodb";
// import { MongoClient, ObjectID } from "mongodb";
// import UserModel from "../model/user";
import OnlineModel from "../model/online";
import MessageModel from "../model/message";
// import connectDB from "../database/mongo";
import jwt from "jsonwebtoken";
import { User, MessageType } from "../types/Types";
interface ISocket extends Socket {
  user?: User | undefined;
}
const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const expressApp = express();
const baseUrl =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:".replace(/^http/, "ws") + port
    : "https://nextchatapp.herokuapp.com:".replace(/^http/, "ws") + port;
const SECRET = process.env.SECRET || "a92955bcf0e92b1deaea647e706bbc9f";
const socketOption = {
  maxHttpBufferSize: 10 * 1024 * 1024,
  allowEIO3: true,
  serveClient: true,
  allowUpgrades: false,
  pingInterval: 20000,
  pingTimeout: 360000,
  cors: {
    origin: baseUrl,
    methods: ["GET", "POST"],
    credentials: true,
  },
};
app
  .prepare()
  .then(() => {
    const httpServer = http.createServer(expressApp);
    // To remove data, use:
    expressApp.use(mongoSanitize());
    expressApp.use(cors());
    expressApp.get("*", (req: Request, res: Response) => {
      const parsedUrl = parse(req.url!, true);
      const { pathname } = parsedUrl;
      // return handle(req, res, parsedUrl);
      if ((pathname !== null && pathname === "/sw.js") || (pathname !== null && /^\/(workbox|worker|fallback)-\w+\.js$/.test(pathname))) {
        const filePath = join(__dirname, ".next", pathname);
        app.serveStatic(req, res, filePath);
      } else {
        return handle(req, res, parsedUrl);
      }
    });
    expressApp.post("*", (req: Request, res: Response) => {
      return handle(req, res);
    });
    expressApp.all("*", (req: Request, res: Response) => {
      return handle(req, res);
    });
    // Socket Code
    let connectedPeers: string[] = [];
    const io = new Server(httpServer, socketOption);
    io.use(function (socket: ISocket, next) {
      if (socket.handshake.query && socket.handshake.query.token) {
        jwt.verify(socket.handshake.query.token.toString(), SECRET, function (err, decoded) {
          if (err) return next(new Error("Authentication error"));
          if (decoded?.user) {
            decoded.user.ID = socket.id;
          }
          socket.user = decoded?.user;
          next();
        });
      } else {
        next(new Error("Authentication error"));
      }
    });
    io.on("connection", async (socket: ISocket) => {
      connectedPeers.push(socket.id);
      io.emit("connected", socket.user);
      socket.on("initUser", async () => {
        connectedPeers.push(socket.id);
        let uniqPeers = connectedPeers.filter((value, index) => connectedPeers.indexOf(value) === index);
        connectedPeers = uniqPeers;
        // const userId = new ObjectID(socket.user?._id);
        const newId = socket.id.toString();
        try {
          // Change User.ID Set new socket id
          // await UserModel.updateUserID(userId, newId);
          const isOnline = await OnlineModel.findUserByUsername(socket.user?.username);
          if (isOnline && isOnline != undefined && isOnline != null && isOnline?.username) {
            // Update socketId for online user
            await OnlineModel.updateSocket(socket.user?.username, newId);
          } else {
            // Add user to online collection
            await OnlineModel.logOnline(socket.user?.username, newId);
          }
          io.emit("connected", socket.user);
          console.log("New User Logged In with ID " + newId);
        } catch (e) {
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
          const res = await MessageModel.postMessage(<MessageType>{
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
            const result2 = await OnlineModel.findUserByUsername(data.receiver);
            if (result2 && result2.socketId) {
              io.sockets.to(socket.id).to(result2.socketId).emit("new_message", res);
              // io.to(socket.id).emit("new_message", res);
              // io.to(result2.socketId).emit("new_message", res);
              // io.to(result2[0].socketId).emit("new_message", res);
              //socket.broadcast.to(result2[0].socketId).emit("willInitiateCall", res);
              // io.in(result2[0].socketId).emit("new_message", res);
            } else {
              // io.sockets.to(socket.id).emit("new_message", res);
              io.to(socket.id).emit("new_message", res);
            }
            // io.to(result2.socketId).emit("new_message", res);
            // socket.to(socket.id).emit("new_message", res);
            // io.to(socket.id).to(result2[0].socketId).emit("new_message", res);
          }
        } catch (e) {
          console.log(e);
        }
      });
      socket.on("read_message", async (data) => {
        let id = data._id;
        try {
          const res = await MessageModel.updateRead(id);
          if (res) {
            io.emit("message_readed", res.res);
          }
        } catch (e) {
          console.log(e);
        }
      });
      socket.on("pre-offer", async (data) => {
        connectedPeers.push(socket.id);
        let uniqPeers = connectedPeers.filter((value, index) => connectedPeers.indexOf(value) === index);
        connectedPeers = uniqPeers;
        const { caleePersonalCode, callType } = data;
        const connectedPeer = connectedPeers.find((peerSocketId) => {
          return peerSocketId === caleePersonalCode;
        });
        if (connectedPeer) {
          const data2 = {
            callerSocketId: socket.id,
            callType: callType,
            user: socket.user,
          };
          io.to(caleePersonalCode).emit("pre-offer", data2);
          // socket.to(caleePersonalCode).emit("pre-offer", data2);
        } else {
          const data2 = {
            preOfferAnswer: "CALEE_NOT_FOUND",
          };
          io.to(socket.id).emit("pre-offer-answer", data2);
        }
      });
      socket.on("pre-offer-answer", async (data) => {
        const connectedPeer = connectedPeers.find((peerSocketId) => {
          return peerSocketId === data.callerSocketId;
        });
        if (connectedPeer) {
          io.to(data.callerSocketId).emit("pre-offer-answer", data);
        }
      });
      socket.on("webRTC-signaling", (data) => {
        const { connectedUserSocketId } = data;
        const connectedPeer = connectedPeers.find((peerSocketId) => {
          return peerSocketId === connectedUserSocketId;
        });
        if (connectedPeer) {
          io.to(connectedUserSocketId).emit("webRTC-signaling", data);
        }
      });
      socket.on("disconnect", async (cause) => {
        try {
          console.log("disconnected :", cause);
          // Delete User From Online Collection
          await OnlineModel.deleteOnline(socket.user?.username);
          socket.removeAllListeners();
          const newConnectedPeers = connectedPeers.filter((peerSocketId) => {
            return peerSocketId !== socket.id;
          });
          connectedPeers = newConnectedPeers;
          io.socketsLeave(socket.id);
          io.emit("disconnected", socket.user);
        } catch (e) {
          console.log(e);
        }
      });
    });
    httpServer.listen(port, (err?: any) => {
      if (err) throw err;
      console.log(`> Server listening at http://localhost:${port} as ${dev ? "development" : process.env.NODE_ENV}`);
    });
  })
  .catch((exception) => {
    console.error(exception.stack);
    process.exit(1);
  });