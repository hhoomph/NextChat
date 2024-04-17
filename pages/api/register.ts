import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../types/Types";
import UserModel from "../../model/user";
import connectDB from "../../database/mongo";
const KEY = process.env.SECRET;
const saltRounds = 12;
const register = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  await connectDB();
  switch (method) {
    case "POST":
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "نام کاربری و پسورد را پر کنید." });
        res.end();
      }
      try {
        // Check for username conflict
        // const usernameConflict = await col.findOne({
        //   username: { $regex: "^" + username + "$", $options: "i" },
        // });
        const usernameConflict = await UserModel.findUser(username);
        if (usernameConflict) {
          return res.status(409).json({ message: "نام کاربری تکراری است." });
          res.end();
        } else {
          // Hash password
          const passwordHash = await bcrypt.hash(password, saltRounds);
          // Insert user into database
          const timestamp = new Date().getTime();
          // const result = await col.insertOne({
          //   username: username,
          //   password: passwordHash,
          //   ID: "",
          //   createdAt: timestamp,
          // });
          // const result = await UserModel.createUser(username, passwordHash);
          const result = await UserModel.createUser(username, passwordHash);
          const user: User = {
            _id: result?._id.toString(),
            username: username,
            createdAt: timestamp,
          };
          /* Sign token */
          const token = jwt.sign(
            {
              user: user,
            },
            KEY,
            { expiresIn: "24h" }
          );
          //Get date from Timestamp ->
          // var date = new Date(creationDate);
          // console.log(date.toDateString());
          // console.log(date.getFullYear());
          // console.log(date.getMinutes());
          // console.log(date.getSeconds());
          // console.log(date.getHours());
          // console.log(date.toLocaleTimeString());
          // Send all-clear with _id as token
          return res.status(200).json({ token: token });
          res.end();
        }
      } catch (err:any) {
        const { response } = err;
        return response ? res.status(response.status).json({ message: response.statusText }) : res.status(500).json({ message: err.message });
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
export default register;