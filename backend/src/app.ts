import express from "express";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/task";
import { track } from "./middlewares/track";

const app = express();

app.use(express.json());
app.use("/", track);
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

export default app;
