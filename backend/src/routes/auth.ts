import express from "express";
import { register, login, logOut, refresh } from "../controllers/auth";
import { validate } from "../middlewares/validate";
import { loginSchema, registerSchema } from "../validations/auth";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.patch("/logout", logOut);
router.patch("/refresh", refresh);

export default router;
