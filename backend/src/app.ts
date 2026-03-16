import express from "express";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/task";
import { track } from "./middlewares/track";
import credentials from "./middlewares/credentials";
import corsOptions from "./config/cors";
import cors from "cors";
const app = express();
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());
app.use("/", track);
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

export default app;
