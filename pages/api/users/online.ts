import type { NextApiRequest, NextApiResponse } from "next";
import OnlineModel from "../../../model/online";
import connectDB from "../../../database/mongo";
const Online = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  await connectDB();
  switch (method) {
    case "POST":
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ message: "نام کاربری را وارد کنید." });
      }
      try {
        const resOnline = await OnlineModel.checkOnline(username);
        if (!resOnline || resOnline === null || resOnline === undefined || resOnline.username == undefined) {
          return res.status(200).json({ online: false });
        } else {
          return res.status(200).json({ online: true });
        }
      } catch (err: any) {
        const { response } = err;
        return response ? res.status(response.status).json({ message: response?.statusText }) : res.status(500).json({ message: err?.message });
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
export default Online;