import { Request, Response } from "express";
import { TaskService } from "../services/taskService";

const taskService = new TaskService();

export class TaskController {
  async getAllTasks(req: Request, res: Response): Promise<void> {
    try {
      const requestingUserId = req.user?.ACCESS_ID;
      const userPermissions = req.user?.permissions || [];
      if (!requestingUserId) {
        res.status(401).json({ message: "Unauthorized: User ID not found." });
        return;
      }
      const tasks = await taskService.getAllTasks(
        requestingUserId,
        userPermissions
      );
      res.json(tasks);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      res
        .status(error.message.includes("Unauthorized") ? 403 : 500)
        .json({ message: error.message || "Failed to retrieve tasks." });
    }
  }

  async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const requestingUserId = req.user?.ACCESS_ID;
      const userPermissions = req.user?.permissions || [];

      if (!requestingUserId) {
        res.status(401).json({ message: "Unauthorized: User ID not found." });
        return;
      }

      const task = await taskService.getTaskById(
        id,
        requestingUserId,
        userPermissions
      );
      if (task) {
        res.json(task);
      } else {
        res.status(404).json({ message: "Task not found." });
      }
    } catch (error: any) {
      console.error("Error fetching task by ID:", error);
      res
        .status(error.message.includes("Unauthorized") ? 403 : 500)
        .json({ message: error.message || "Failed to retrieve task." });
    }
  }

  async createTask(req: Request, res: Response): Promise<void> {
    try {
      //i check the user's permissions. and see if he can acesss it.
      const createdByUserId = req.user?.ACCESS_ID;
      const userPermissions = req.user?.permissions || [];

      if (!createdByUserId) {
        res.status(401).json({ message: "Unauthorized: User ID not found." });
        return;
      }

      const newTask = await taskService.createTask(
        {
          ...req.body,
          CREATED_BY: createdByUserId, // Assign the authenticated user as creator
        },
        createdByUserId,
        userPermissions
      ); // Pass requesting user ID and permissions for permission check
      res.status(201).json(newTask);
    } catch (error: any) {
      console.error("Error creating task:", error);
      res
        .status(error.message.includes("Unauthorized") ? 403 : 500)
        .json({ message: error.message || "Failed to create task." });
    }
  }

  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const requestingUserId = req.user?.ACCESS_ID;
      const userPermissions = req.user?.permissions || [];

      if (!requestingUserId) {
        res.status(401).json({ message: "Unauthorized: User ID not found." });
        return;
      }

      const updatedTask = await taskService.updateTask(
        id,
        req.body,
        requestingUserId,
        userPermissions
      ); // Pass permissions
      if (updatedTask) {
        res.json(updatedTask);
      } else {
        res.status(404).json({ message: "Task not found." });
      }
    } catch (error: any) {
      console.error("Error updating task:", error);
      res
        .status(error.message.includes("Unauthorized") ? 403 : 500)
        .json({ message: error.message || "Failed to update task." });
    }
  }

  async softDeleteTask(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const requestingUserId = req.user?.ACCESS_ID;
      const userPermissions = req.user?.permissions || [];

      if (!requestingUserId) {
        res.status(401).json({ message: "Unauthorized: User ID not found." });
        return;
      }

      const deletedTask = await taskService.softDeleteTask(
        id,
        requestingUserId,
        userPermissions
      ); // Pass permissions
      if (deletedTask) {
        res.status(204).send(); // 204 No Content for successful deletion
      } else {
        res.status(404).json({ message: "Task not found or already deleted." });
      }
    } catch (error: any) {
      console.error("Error soft deleting task:", error);
      res
        .status(error.message.includes("Unauthorized") ? 403 : 500)
        .json({ message: error.message || "Failed to delete task." });
    }
  }
}
