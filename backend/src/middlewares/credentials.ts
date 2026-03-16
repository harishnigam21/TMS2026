import { Response, NextFunction } from "express";
import { whitelist } from "../config/whitelist";
import { AuthRequest } from "./auth";

const credentials = (req: AuthRequest, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  if (origin && whitelist.includes(origin)) {
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  next();
};

export default credentials;
