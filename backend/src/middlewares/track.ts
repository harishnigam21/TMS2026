import { Request, Response, NextFunction } from "express";
export const track = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();
  res.on("finish", () => {
    const finished = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${finished}ms`,
    );
  });

  next();
};
