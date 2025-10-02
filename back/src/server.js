// // import dotenv from 'dotenv';
// // import app from './app.js';
// // import connectDB from './config/db.js';

// // dotenv.config();
// // const PORT = process.env.PORT || 5000;

// // const bootstrap = async () => {
// //   await connectDB();
// //   app.listen(PORT, () => console.log(`✅ API FleetCore en puerto ${PORT}`));
// // };

// // bootstrap().catch((err) => { console.error(err); process.exit(1); });


// //2
// // import express from "express";
// // import dotenv from "dotenv";
// // import connectDB from "./config/db.js";

// // dotenv.config(); // lee back/.env

// // const app = express();
// // app.use(express.json());

// // await connectDB();

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));

// // server.js
// import dotenv from "dotenv";
// import connectDB from "./config/db.js";
// import app from "./app.js";

// dotenv.config(); // lee back/.env (o usa { path: ".env.local" })

// const start = async () => {
//   try {
//     await connectDB();
//     const PORT = process.env.PORT || 5000;
//     app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
//   } catch (err) {
//     console.error("Fallo al iniciar:", err);
//     process.exit(1);
//   }
// };

// start();
// back/src/server.js
//
// Punto de entrada del backend FleetCore Suite
// - Conecta a MongoDB
// - Arranca Express (app.js)
// - Loggea errores de conexión y caídas no manejadas
//
// Requiere .env con:
//   MONGO_URI=mongodb://127.0.0.1:27017/fleetcore
//   PORT=5000
//
// Nota: Usa app.js para definir rutas y middlewares.

import dotenv from 'dotenv'
import mongoose from 'mongoose'
import app from './app.js'

dotenv.config()

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fleetcore'

// === Conexión a MongoDB ===
mongoose.set('strictQuery', true)

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(`MongoDB conectado: ${mongoose.connection.host}`)
    // Arrancar servidor Express
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en puerto ${PORT}`)
    })
  })
  .catch(err => {
    console.error('Error conectando a MongoDB:', err.message)
    process.exit(1)
  })

// === Manejo de errores globales ===

// Errores no manejados en promesas
process.on('unhandledRejection', err => {
  console.error('⚠️  Unhandled Rejection:', err)
})

// Excepciones no atrapadas
process.on('uncaughtException', err => {
  console.error('💥 Uncaught Exception:', err)
  process.exit(1) // mejor salir para evitar estado inconsistente
})
