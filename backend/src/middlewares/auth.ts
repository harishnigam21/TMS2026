import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: number;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(403)
      .json({ message: "Looks Like you have not logged in yet" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_KEY as string,
    ) as { id: number };

    req.userId = decoded.id;

    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
