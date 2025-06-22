import { Request, Response } from "express";
import { AuthService } from "../services/authService";

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: "Username and password are required." });
      return;
    }

    try {
      const token = await authService.login(username, password);
      if (token) {
        res.json({ token, message: "Login successful!" });
      } else {
        res
          .status(401)
          .json({ message: "Invalid credentials or inactive user." });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "An error occurred during login." });
    }
  }
}
