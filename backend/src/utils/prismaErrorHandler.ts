import { Prisma } from "@prisma/client";

export const handlePrismaError = (error: any) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return { status: 409, message: "Resource already exists" };

      case "P2003":
        return { status: 400, message: "Foreign key constraint failed" };

      case "P2025":
        return { status: 404, message: "Record not found" };

      default:
        return { status: 400, message: "Database error" };
    }
  }

  return null;
};
