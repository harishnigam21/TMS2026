import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/auth";
import { handlePrismaError } from "../utils/prismaErrorHandler";

export const createTask = async (req: AuthRequest, res: Response) => {
  const { title } = req.body;
  try {
    const checkTitle = title?.trim();
    if (!checkTitle || checkTitle.length < 2) {
      return res.status(400).json({ message: "Invalid Title Name" });
    }
    const task = await prisma.task.create({
      data: {
        title: checkTitle,
        userId: req.userId!,
      },
    });
    return res.status(201).json({
      message: "Successfully Created Task",
      data: { id: task.id, title: task.title, completed: task.completed },
    });
  } catch (error) {
    console.error("Error from createTask controller", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
    });

    return res
      .status(200)
      .json({ message: "Successfully got all tasks", data: tasks });
  } catch (error) {
    console.error("Error from getTasks controller", error);
    const prismaError = handlePrismaError(error, "Task");
    if (prismaError) {
      return res.status(prismaError.status).json({
        message: prismaError.message,
      });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    const updatedTask = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        where: { id, userId: req.userId },
      });

      return tx.task.update({
        where: { id, userId: req.userId },
        data: {
          completed: !task!.completed,
        },
      });
    });
    return res
      .status(200)
      .json({
        message: `${updatedTask.completed ? "Task Completed" : "Task not completed"}`,
        data: updatedTask,
      });
  } catch (error) {
    console.error("Error from updateTask controller", error);
    const prismaError = handlePrismaError(error, "Task");
    if (prismaError) {
      return res.status(prismaError.status).json({
        message: prismaError.message,
      });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  try {
    const task = await prisma.task.delete({
      where: { id, userId: req.userId },
    });
    res.status(200).json({ message: "Task deleted", data: task.id });
  } catch (error) {
    console.error("Error from deleteTask controller", error);
    const prismaError = handlePrismaError(error, "Task");
    if (prismaError) {
      return res.status(prismaError.status).json({
        message: prismaError.message,
      });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
