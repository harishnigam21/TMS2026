import express from "express";
import { register, login } from "../controllers/auth";
import { validate } from "../middlewares/validate";
import { loginSchema, registerSchema } from "../validations/auth";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

export default router;
