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
      const { usrName, receiverName } = req.body;
      if (!usrName || !receiverName) {
        return res.status(400).json({ message: "فرستنده و گیرنده پیام را مشخص کنید." });
      }
      const authHead = req.headers.authorization;
      if (authHead) {
        let token = authHead.split(" ")[1];
        jwt.verify(token, KEY, (err) => {
          if (err) {
            return res.status(403).json({ message: "احراز هویت شما تایید نشده است." });
          }
        });
      } else {
        return res.status(401).json({ message: "این درخواست برای شما مجاز نمی باشد." });
      }
      let twoUser = usrName + "," + receiverName;
      let array2 = twoUser.split(",").sort();
      const convId = `${array2[0]}_${array2[1]}`;
      const deletRes = await MessageModel.deleteMessagesById(convId);
      // If no username, user doesn't exist
      if (!deletRes || deletRes === null || deletRes === undefined) {
        return res.status(404).json({ message: "هنوز پیامی نیومده." });
      } else {
        return res.status(200).json({ message: "همه ی پیام ها حذف شدند." });
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