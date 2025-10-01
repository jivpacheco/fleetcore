// import dotenv from 'dotenv';
// import app from './app.js';
// import connectDB from './config/db.js';

// dotenv.config();
// const PORT = process.env.PORT || 5000;

// const bootstrap = async () => {
//   await connectDB();
//   app.listen(PORT, () => console.log(`✅ API FleetCore en puerto ${PORT}`));
// };

// bootstrap().catch((err) => { console.error(err); process.exit(1); });


//2
// import express from "express";
// import dotenv from "dotenv";
// import connectDB from "./config/db.js";

// dotenv.config(); // lee back/.env

// const app = express();
// app.use(express.json());

// await connectDB();

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));

// server.js
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";

dotenv.config(); // lee back/.env (o usa { path: ".env.local" })

const start = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
  } catch (err) {
    console.error("Fallo al iniciar:", err);
    process.exit(1);
  }
};

start();
