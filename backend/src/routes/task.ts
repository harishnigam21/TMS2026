import express from "express";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  addNote,
  editNote,
  deleteNote,
} from "../controllers/task";

import { authenticate } from "../middlewares/auth";

const router = express.Router();

router.post("/", authenticate, createTask);
router.get("/", authenticate, getTasks);
router.patch("/:id/toggle", authenticate, updateTask);
router.patch("/:id/note", authenticate, addNote);
router.post("/:tid/note/:nid/edit", authenticate, editNote);
router.delete("/:tid/note/:nid/delete", authenticate, deleteNote);
router.delete("/:id", authenticate, deleteTask);

export default router;
