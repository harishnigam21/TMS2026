import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/auth";
export const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        tasks: true,
      },
    });
    if (!user) {
      return res.status(400).json({ message: "You hare not valid User" });
    }
    return res.status(200).json({
      message: "Successfully verified",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        tasks: user.tasks,
      },
    });
  } catch (error) {
    console.error("Error from getUser controller", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
