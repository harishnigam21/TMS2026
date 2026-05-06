import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/auth";
import { handlePrismaError } from "../utils/prismaErrorHandler";

export const createTask = async (req: AuthRequest, res: Response) => {
  const { title } = req.body || {};
  try {
    const checkTitle = title?.trim();
    if (!checkTitle || checkTitle.length < 2) {
      return res.status(400).json({ message: "Invalid Title Name" });
    }
    const task = await prisma.task.create({
      data: {
        title: checkTitle,
        description: "",
        userId: req.userId!,
      },
    });
    return res.status(201).json({
      message: "Successfully Created Task",
      data: {
        id: task.id,
        title: task.title,
        completed: task.completed,
        description: task.description,
        createdAt: task.createdAt,
      },
    });
  } catch (error) {
    console.error("Error from createTask controller", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// export const getTasks = async (req: AuthRequest, res: Response) => {
//   try {
//     const tasks = await prisma.task.findMany({
//       where: { userId: req.userId },
//     });

//     return res
//       .status(200)
//       .json({ message: "Successfully got all tasks", data: tasks });
//   } catch (error) {
//     console.error("Error from getTasks controller", error);
//     const prismaError = handlePrismaError(error, "Task");
//     if (prismaError) {
//       return res.status(prismaError.status).json({
//         message: prismaError.message,
//       });
//     }
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const limit = 9;
    const page = req.query.page ? Number(req.query.page) : 1;
    const filter = req.query.filter as string | undefined;
    const search = req.query.search as string | undefined;
    const filters: any = {
      userId: req.userId,
      ...(filter !== undefined &&
        (filter == "completed"
          ? { completed: true }
          : filter == "incompleted"
            ? { completed: false }
            : filter == "starred"
              ? { star: true }
              : {})),
      ...(search && {
        title: {
          contains: search,
        },
      }),
    };

    const skip = (page - 1) * limit;

    // total count
    const totalItems = await prisma.task.count({
      where: filters,
    });

    const totalPages = Math.ceil(totalItems / limit);

    const tasks = await prisma.task.findMany({
      take: limit,
      skip: skip,
      where: filters,
      orderBy: { id: "desc" },
      include: {
        notes: { take: 5, orderBy: { id: "asc" } },
        _count: { select: { notes: true } },
      },
    });
    let frameTask = [];
    for (const task of tasks) {
      const { _count, ...rest } = task;
      frameTask.push({ ...rest, noteCount: _count.notes });
    }
    return res.status(200).json({
      message: "Successfully got tasks",
      data: frameTask,
      pagination: {
        thisPage: page,
        totalPages,
        totalItems,
        limit,
        hasMore: page < totalPages,
      },
    });
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
    return res.status(200).json({
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
export const starTask = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    const starTask = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        where: { id, userId: req.userId },
      });

      return tx.task.update({
        where: { id, userId: req.userId },
        data: {
          star: !task!.star,
        },
      });
    });
    return res.status(200).json({
      message: `${starTask.star ? "Star Added" : "Star Removed"}`,
      data: starTask,
    });
  } catch (error) {
    console.error("Error from starTask controller", error);
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
export const getAllNotes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const taskId = Number(req.params.id);
    const getNotes = await prisma.$transaction(async (tx) => {
      const taskExist = await tx.task.findUnique({
        where: { id: taskId, userId },
      });
      if (!taskExist) {
        return res.status(404).json({ message: "Task not found" });
      }
      return tx.note.findMany({
        where: { taskId: taskExist.id },
        orderBy: { id: "asc" },
      });
    });
    console.log("Successfully got all notes of task");
    return res.status(200).json({ data: getNotes });
  } catch (error) {
    console.error("Error from getAllNotes controller", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const addNote = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = Number(req.params.id);
    const { note } = req.body || {};

    const cleanNote = note?.trim();
    if (!cleanNote || cleanNote.length < 2) {
      return res.status(400).json({ message: "Invalid Note" });
    }

    const newNote = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        where: { id: taskId, userId: req.userId },
      });

      if (!task) {
        throw new Error("Task not found");
      }

      const note = tx.note.create({
        data: {
          note: cleanNote,
          taskId: taskId,
        },
      });
      await tx.task.update({
        where: { id: taskId },
        data: { updatedAt: new Date() },
      });
      return note;
    });

    return res.status(201).json({
      message: "Note added successfully",
      data: newNote,
    });
  } catch (error) {
    console.error("Error from addNote controller", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const editNote = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = Number(req.params.tid);
    const noteId = Number(req.params.nid);
    const userId = Number(req.userId);
    const { note } = req.body || {};

    const cleanNote = note?.trim();
    if (!cleanNote || cleanNote.length < 2) {
      return res.status(400).json({ message: "Invalid Note" });
    }

    const editNote = await prisma.$transaction(async (tx) => {
      const note = await tx.note.findUnique({
        where: { id: noteId, taskId, task: { userId } },
      });

      if (!note) {
        throw new Error("Note not found");
      }

      const Enote = tx.note.update({
        where: { id: noteId },
        data: { note: cleanNote },
      });
      await tx.task.update({
        where: { id: taskId },
        data: { updatedAt: new Date() },
      });
      return Enote;
    });

    return res.status(200).json({
      message: "Note update successfully",
      data: editNote,
    });
  } catch (error: any) {
    console.error("Error from editNote controller", error);
    if (error.message == "Note not found") {
      return res.status(404).json({ message: "Note not found" });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteNote = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = Number(req.params.tid);
    const noteId = Number(req.params.nid);
    const userId = Number(req.userId);
    const newDate = new Date();

    const deleteNote = await prisma.$transaction(async (tx) => {
      const note = await tx.note.findUnique({
        where: { id: noteId, taskId, task: { userId } },
      });

      if (!note) {
        throw new Error("Note not found");
      }

      const Dnote = tx.note.delete({
        where: { id: noteId },
      });
      await tx.task.update({
        where: { id: taskId },
        data: { updatedAt: newDate },
      });
      return Dnote;
    });

    return res.status(200).json({
      message: "Note deleted successfully",
      data: { ...deleteNote, updatedAt: newDate },
    });
  } catch (error: any) {
    console.error("Error from deleteNote controller", error);
    if (error.message == "Note not found") {
      return res.status(404).json({ message: "Note not found" });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const doneNote = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = Number(req.params.tid);
    const noteId = Number(req.params.nid);
    const userId = Number(req.userId);
    const markNote = await prisma.$transaction(async (tx) => {
      const note = await tx.note.findUnique({
        where: { id: noteId, taskId, task: { userId } },
        include: {
          task: true,
        },
      });

      if (!note) {
        throw new Error("Note not found");
      }
      if (note?.task.completed) {
        return res.status(409).json({
          message:
            "Looks like your Task has been completed, make it not complete to mark notes",
        });
      }

      const Mnote = tx.note.update({
        where: { id: noteId },
        data: { completed: true },
      });
      await tx.task.update({
        where: { id: taskId },
        data: { updatedAt: new Date() },
      });
      return Mnote;
    });

    return res.status(200).json({
      message: "Note marked successfully",
      data: markNote,
    });
  } catch (error: any) {
    console.error("Error from doneNote controller", error);
    if (error.message == "Note not found") {
      return res.status(404).json({ message: "Note not found" });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const unDoneNote = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = Number(req.params.tid);
    const noteId = Number(req.params.nid);
    const userId = Number(req.userId);
    const markNote = await prisma.$transaction(async (tx) => {
      const note = await tx.note.findUnique({
        where: { id: noteId, taskId, task: { userId } },
        include: {
          task: true,
        },
      });
      if (!note) {
        throw new Error("Note not found");
      }
      if (note?.task.completed) {
        return res.status(409).json({
          message:
            "Looks like your Task has been completed, make it not complete to mark notes",
        });
      }

      const Mnote = tx.note.update({
        where: { id: noteId },
        data: { completed: false },
      });
      await tx.task.update({
        where: { id: taskId },
        data: { updatedAt: new Date() },
      });
      return Mnote;
    });

    return res.status(200).json({
      message: "Note marked successfully",
      data: markNote,
    });
  } catch (error: any) {
    console.error("Error from unDoneNote controller", error);
    if (error.message == "Note not found") {
      return res.status(404).json({ message: "Note not found" });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
