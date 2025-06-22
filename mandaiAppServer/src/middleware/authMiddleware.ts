import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

// Extend Request interface to include the user property with permissions (number array)
declare module "express-serve-static-core" {
  interface Request {
    user?: { ACCESS_ID: number; USERNAME: string; permissions: number[] }; // UPDATED: permissions is number[]
  }
}

const jwtSecret = process.env.JWT_SECRET || "supersecretjwtkey";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    res.status(401).json({ message: "Authentication token required." });
    return;
  }

  jwt.verify(token, jwtSecret, (err: any, user: any) => {
    if (err) {
      console.error("JWT verification error:", err);
      res.status(403).json({ message: "Invalid or expired token." });
      return;
    }
    req.user = user; // user now contains ACCESS_ID, USERNAME, and permissions (number[])
    next();
  });
};
