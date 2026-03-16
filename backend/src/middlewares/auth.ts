import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
 userId?: number;
}

export const authenticate = (
 req: AuthRequest,
 res: Response,
 next: NextFunction
) => {

 const token = req.headers.authorization?.split(" ")[1];

 if (!token) {
  return res.status(401).json({ message: "No token" });
 }

 try {

  const decoded = jwt.verify(token, "SECRET_KEY") as { id: number };

  req.userId = decoded.id;

  next();

 } catch {
  res.status(401).json({ message: "Invalid token" });
 }

};