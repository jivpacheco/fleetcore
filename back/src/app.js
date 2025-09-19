// import express from 'express';
// import cors from 'cors';
// import morgan from 'morgan';

// const app = express();
// app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));
// app.use(express.json());
// app.use(morgan('dev'));

// app.get('/api/health', (_req, res) =>
//   res.json({ ok: true, name: 'FleetCore Suite API' })
// );

// export default app;

// app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
// import rutas from "./routes/index.js";
import testRoutes from "./routes/test.routes.js"; // prueba
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(testRoutes); // prueba

// Rutas
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.get("/api/ping", (req, res) => res.json({ ok: true, ts: Date.now() }));


// exporta la instancia sin escuchar el puerto (útil para tests)
export default app;
