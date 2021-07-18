import mongoose from "mongoose";
const dbName = process.env.DBName;
// const dbUrl = process?.env?.DATABASE_URL !== undefined ? process?.env?.DATABASE_URL.toString() : "mongodb://localhost:27017/";
const dbUrl =
  process.env.NODE_ENV !== "production"
    ? process?.env?.DATABASE_URL.toString()
    : `mongodb+srv://oomph:<${process?.env?.DBPass}>@cluster0.xqf1t.mongodb.net/${dbName}?retryWrites=true&w=majority`;
// connecting to mongo
// const mongoDb = mongoose.connect(dbUrl + dbName, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useCreateIndex: true,
//   useFindAndModify: false,
// });
// async function connectDB() {
//   mongoose.connect(dbUrl + dbName, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//     bufferCommands: false,
//     bufferMaxEntries: 0,
//   });
//   mongoose.connection.on("connected", async () => {
//     console.log("Connected to Mongo");
//   });
//   mongoose.connection.on("disconnected", () => {
//     console.log("Disconnected from Mongo");
//     mongoose.connection.close();
//   });
//   mongoose.connection.on("error", (error) => {
//     console.log(`Failing to connect to Mongo`, error);
//     mongoose.disconnect();
//   });
// }
declare global {
  namespace NodeJS {
    interface Global {
      mongoose: { conn: any; promise: any };
    }
  }
}
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}
async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: true,
      useFindAndModify: false,
      useCreateIndex: true,
    };
    // cached.promise = mongoose.connect(dbUrl + dbName, opts).then((mongoose) => {
    //   mongoose.set('useNewUrlParser', true);
    //   return mongoose;
    // });
    // cached.promise = mongoose.connect(dbUrl + dbName, opts).then((mongoose) => {
    cached.promise = mongoose.connect(dbUrl, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
// const connectDB = async () => {
//   await mongoose
//     .connect(dbUrl + dbName, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       useCreateIndex: true,
//       useFindAndModify: false,
//     })
//     .then((x) => {
//       console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`);
//     })
//     .catch((err) => {
//       console.error("Error connecting to mongo", err);
//     });
//   return mongoose;
// };
export default connectDB;