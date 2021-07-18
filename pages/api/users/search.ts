import type { NextApiRequest, NextApiResponse } from "next";
import UserModel from "../../../model/user";
import jwt from "jsonwebtoken";
import connectDB from "../../../database/mongo";
const KEY = process.env.SECRET;
const Search = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  await connectDB();
  switch (method) {
    case "GET":
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.split(" ")[1].toString();
        jwt.verify(token, KEY, (err) => {
          if (err) {
            return res.status(403).json({ message: "احراز هویت شما تایید نشده است." });
            res.end();
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
        res.end();
      }
      const { q } = req.query;
      let userRes = await UserModel.findSearch(q.toString());
      // If no username, user doesn't exist
      if (!userRes || userRes === null || userRes === undefined) {
        return res.status(404).json({ message: "کاربری با این نام پیدا نشد." });
      } else {
        // Send all-clear with _id as token
        return res.status(200).json({ users: userRes });
      }
      break;
    case "POST":
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