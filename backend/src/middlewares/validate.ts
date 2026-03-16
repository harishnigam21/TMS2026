import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validate =
  (schema: ZodType<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};

      result.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        formattedErrors[field] = err.message;
      });

      return res.status(400).json({
        message: "Validation failed",
        errors: formattedErrors,
      });
    }

    req.body = result.data;

    next();
  };
