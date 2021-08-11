import type { NextApiRequest, NextApiResponse } from "next";
import UserModel from "../../../model/user";
import MessageModel from "../../../model/message";
import jwt from "jsonwebtoken";
import connectDB from "../../../database/mongo";
import { removeDuplicateObjects } from "../../../utils/tools";
const KEY = process.env.SECRET;
const Get = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  await connectDB();
  switch (method) {
    case "POST":
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.split(" ")[1].toString();
        jwt.verify(token, KEY, (err) => {
          if (err) {
            return res.status(403).json({ message: "احراز هویت شما تایید نشده است." });
          }
        });
      } else {
        return res.status(401).json({ message: "این درخواست برای شما مجاز نمی باشد." });
      }
      const { username } = req.body;
      let msgUsers = await MessageModel.gettMessageUsers(username);
      const receivers = msgUsers.map((o: any) => o.receiver);
      const receiversFiltered = receivers.filter(({ receiver }: any, index: any) => !receivers.includes(receiver, index + 1));
      const senders = msgUsers.map((o: any) => o.sender);
      const sendersFiltered = senders.filter(({ sender }: any, index: any) => !senders.includes(sender, index + 1));
      let unifiedUsers = [...receiversFiltered, ...sendersFiltered];
      unifiedUsers = removeDuplicateObjects(unifiedUsers);
      unifiedUsers.map((u: any) => {
        u?.sender ? u.sender : u.receiver;
      });
      const userRes = await UserModel.getUsersOfMessages(unifiedUsers);
      // If no username, user doesn't exist
      if (!userRes || userRes === null || userRes === undefined) {
        return res.status(404).json({ message: "کاربری با این نام پیدا نشد." });
      } else {
        // Send all-clear with _id as token
        return res.status(200).json({ users: userRes });
      }
      break;
    case "GET":
      const authHead = req.headers.authorization;
      if (authHead) {
        const token = authHead.split(" ")[1].toString();
        jwt.verify(token, KEY, (err) => {
          if (err) {
            return res.status(403).json({ message: "احراز هویت شما تایید نشده است." });
            res.end();
          }
        });
      } else {
        return res.status(401).json({ message: "این درخواست برای شما مجاز نمی باشد." });
        res.end();
      }
      const { user } = req.query;
      let userResult = await UserModel.findByUsername(user.toString());
      // If no username, user doesn't exist
      if (!userResult || userResult === null || userResult === undefined) {
        return res.status(404).json({ message: "کاربری با این نام پیدا نشد." });
      } else {
        // Send all-clear with _id as token
        return res.status(200).json({ newUser: userResult });
      }
      break;
    case "PUT":
      break;
    case "PATCH":
      break;
    default:
      break;
  }
};
export default Get;