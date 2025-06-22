import { Router } from "express";
import { TaskController } from "../controllers/taskController";

const router = Router();
const taskController = new TaskController();

router.get("/", taskController.getAllTasks);
router.get("/:id", taskController.getTaskById);
router.post("/", taskController.createTask);
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.softDeleteTask); // Soft delete
//router.get("/hashpasswords/:id", taskController.updateTask);

export default router;
