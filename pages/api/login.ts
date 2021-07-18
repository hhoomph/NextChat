import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../types/Types";
import UserModel from "../../model/user";
import connectDB from "../../database/mongo";
const KEY = process.env.SECRET;
const login = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  await connectDB();
  switch (method) {
    case "POST":
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "نام کاربری و پسورد را پر کنید." });
      }
      try {
        // Try to find username
        let userRes = await UserModel.findUser(username);
        // If no username, user doesn't exist
        if (!userRes) {
          return res.status(404).json({ message: "کاربری با این نام پیدا نشد." });
          res.end();
        } else {
          // Compare user-entered password to stored hash
          const passwordMatch = await bcrypt.compare(password, userRes.password);
          if (passwordMatch) {
            const user: User = {
              _id: userRes._id.toString(),
              username: userRes.username,
              createdAt: userRes.createdAt,
            };
            /* Sign token */
            const token = jwt.sign(
              {
                user: user,
              },
              KEY,
              { expiresIn: "1week" }
            );
            // Send all-clear with _id as token
            res.status(200).json({ token: token });
            res.end();
          } else {
            return res.status(401).json({ message: "رمز عبور اشتباه است." });
          }
        }
      } catch (err) {
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
export default login;