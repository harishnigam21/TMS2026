import express from "express";
import { getUser } from "../controllers/user";
import { authenticate } from "../middlewares/auth";
const router = express.Router();
router.get("/", authenticate, getUser);
export default router;
