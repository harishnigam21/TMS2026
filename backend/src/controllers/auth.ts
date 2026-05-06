import { Request, Response } from "express";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import jwt, {
  JwtPayload,
  TokenExpiredError,
  JsonWebTokenError,
} from "jsonwebtoken";
import { handlePrismaError } from "../utils/prismaErrorHandler";
const in_production = process.env.IN_PRODUCTION === "true";
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
    if (!user) {
      return res.status(400).json({ message: "You have not registered yet" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(403).json({ message: "Invalid password" });
    }
    const accessToken = jwt.sign(
      { id: user.id },
      process.env.ACCESS_TOKEN_KEY as string,
      { expiresIn: "1d" },
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_KEY as string,
      { expiresIn: "7d" },
    );
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: refreshToken,
      },
    });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: in_production,
      sameSite: in_production ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res.status(200).json({
      message: "Successfully verified",
      acTk: accessToken,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error from login controller", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logOut = async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      return res.status(403).json({ message: "Cookie missing" });
    }

    const refreshToken = cookies.jwt;

    const user = await prisma.user.findFirst({
      where: {
        refreshToken: refreshToken,
      },
      select: {
        id: true,
        refreshToken: true,
      },
    });

    if (!user) {
      res.clearCookie("jwt", {
        httpOnly: true,
        secure: in_production,
        sameSite: in_production ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json({ status: true });
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken: "",
      },
    });

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: in_production,
      sameSite: in_production ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({ status: true });
  } catch (error) {
    console.error("Error from logOut controller : ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

interface CustomJwtPayload extends JwtPayload {
  id: number;
}
export const refresh = async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      return res.status(403).json({ message: "Cookie missing" });
    }

    const refreshToken = cookies.jwt;
    const user = await prisma.user.findFirst({
      where: {
        refreshToken: refreshToken,
      },
    });
    if (!user) {
      res.clearCookie("jwt", {
        httpOnly: true,
        secure: in_production,
        sameSite: in_production ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(403).json({ message: "Invalid payload" });
    }
    jwt.verify(
      user.refreshToken as string,
      process.env.REFRESH_TOKEN_KEY as string,
      (err: any, decoded) => {
        if (err || !decoded) {
          if (err instanceof TokenExpiredError) {
            return res.status(403).json({ message: "Refresh token expired" });
          }

          if (err instanceof JsonWebTokenError) {
            return res.status(403).json({ message: "Invalid refresh token" });
          }

          console.error("Verifier Error:", err);
          return res.status(500).json({ message: "Internal Server Error" });
        }

        const payload = decoded as CustomJwtPayload;

        if (user.id !== payload.id) {
          return res.status(403).json({ message: "Invalid token" });
        }

        const access_token = jwt.sign(
          { id: payload.id },
          process.env.ACCESS_TOKEN_KEY as string,
          { expiresIn: "1d" },
        );

        return res.status(200).json({
          acTk: access_token,
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        });
      },
    );
  } catch (error) {
    console.error("Error from handleRefresh controller : ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
