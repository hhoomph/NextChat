import type { NextApiRequest, NextApiResponse } from "next";
import OnlineModel from "../../../model/online";
import jwt from "jsonwebtoken";
import connectDB from "../../../database/mongo";
import { removeDuplicateObjects } from "../../../utils/tools";
import Online from "./online";
const KEY = process.env.SECRET;
const GetId = async (req: NextApiRequest, res: NextApiResponse) => {
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
      const userRes = await OnlineModel.findUserByUsername(username);
      // If no username, user doesn't exist
      if (!userRes || userRes === null || userRes === undefined) {
        return res.status(404).json({ message: "کاربری با این نام پیدا نشد." });
      } else {
        // Send all-clear with _id as token
        return res.status(200).json({ user: userRes });
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
export default GetId;