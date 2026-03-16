import { Request, Response } from "express";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { handlePrismaError } from "../utils/prismaErrorHandler";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
      },
    });
    return res.status(201).json({ message: "Successfully Registered" });
  } catch (error) {
    console.error("Error from register controller", error);
    const prismaError = handlePrismaError(error, "User");
    if (prismaError) {
      return res.status(prismaError.status).json({
        message: prismaError.message,
      });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id }, "SECRET_KEY");
    return res
      .status(200)
      .json({
        message: "Successfully verified",
        acTk: token,
        data: { id: user.id, name: user.name, email: user.email },
      });
  } catch (error) {
    console.error("Error from login controller", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
