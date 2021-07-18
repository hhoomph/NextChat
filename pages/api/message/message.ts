import type { NextApiRequest, NextApiResponse } from "next";
import MessageModel from "../../../model/message";
// import { MessageType } from "../../../types/Types";
import jwt from "jsonwebtoken";
import connectDB from "../../../database/mongo";
const KEY = process.env.SECRET;
const Search = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  await connectDB();
  switch (method) {
    case "POST":
      const { username, receiver } = req.body;
      if (!username || !receiver) {
        return res.status(400).json({ message: "فرستنده و گیرنده پیام را مشخص کنید." });
      }
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, KEY, (err) => {
          if (err) {
            return res.status(403).json({ message: "احراز هویت شما تایید نشده است." });
          }
        });
        // jwt.verify(token, KEY, (err, payload) => {
        //   if (err) {
        //     res.status(403).json({ message: "احراز هویت شما تایید نشده است." });
        //   }
        //   const currentUser = payload?.user;
        // });
      } else {
        return res.status(401).json({ message: "این درخواست برای شما مجاز نمی باشد." });
      }
      let twoUsr = username + "," + receiver;
      let array = twoUsr.split(",").sort();
      const conversationId = `${array[0]}_${array[1]}`;
      let messages = await MessageModel.getMessagesById(conversationId);
      // If no username, user doesn't exist
      if (!messages || messages === null || messages === undefined) {
        return res.status(404).json({ message: "هنوز پیامی نیومده." });
      } else {
        let result: Array<any> = [];
        await messages.map(async (msg) => {
          if (msg.receiver === username) {
            await MessageModel.updateRead(msg._id);
            msg.read = true;
          }
          result.push(msg);
          return msg;
        });
        return res.status(200).json({ messages: messages });
      }
      break;
    case "GET":
      break;
    case "PUT":
      break;
    case "PATCH":
      break;
    default:
      break;
  }
};
export default Search;