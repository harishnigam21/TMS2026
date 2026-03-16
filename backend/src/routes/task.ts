import express from "express";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from "../controllers/task";

import { authenticate } from "../middlewares/auth";

const router = express.Router();

router.post("/", authenticate, createTask);
router.get("/", authenticate, getTasks);
router.put("/:id", authenticate, updateTask);
router.delete("/:id", authenticate, deleteTask);

export default router;
