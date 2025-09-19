// import mongoose from 'mongoose';
// const connectDB = async () => {
//   const uri = process.env.MONGO_URI;
//   if (!uri) throw new Error('Falta MONGO_URI en .env');
//   mongoose.set('strictQuery', true);
//   await mongoose.connect(uri);
//   console.log('✅ MongoDB conectado');
// };
// export default connectDB;
import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) throw new Error("Falta MONGO_URI");
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB conectado:", conn.connection.host);
};

export default connectDB;
