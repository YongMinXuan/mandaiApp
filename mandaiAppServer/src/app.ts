import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import taskRoutes from "./routes/taskRoutes";
import authRoutes from "./routes/authRoutes";
import { authenticateToken } from "./middleware/authMiddleware";

const app = express();

app.use(cors());
app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully!");
  })
  .catch((error) => console.error("Database connection error: ", error));

// Authentication routes (no token needed here)
app.use("/api/auth", authRoutes);

// Protect task routes with authentication middleware
app.use("/api/tasks", authenticateToken, taskRoutes);

// Basic Error Handling Middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something broke!" }); // Send JSON error
  }
);

export default app;
