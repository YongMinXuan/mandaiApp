import { AppDataSource } from "../data-source";
import { TASKS } from "../entities/TASKS";
import { ACCESS_MATRIX } from "../entities/ACCESS_MATRIX";
import { ACCESS_MATRIX_USR_ROLES } from "../entities/ACCESS_MATRIX_USR_ROLES";
import { ACCESS_MATRIX_ROLE_PERMS } from "../entities/ACCESS_MATRIX_ROLE_PERMS";
import { ACCESS_MATRIX_PERMISSIONS } from "../entities/ACCESS_MATRIX_PERMISSIONS";
import { GLOBALVARS } from "../globalvariable/GLOBALVARS"; // NEW: Import permission constants

// Extend Request to include user property
declare module "express-serve-static-core" {
  interface Request {
    user?: { ACCESS_ID: number; USERNAME: string; permissions: number[] }; // UPDATED: permissions array is now numbers
  }
}

export class TaskService {
  private taskRepository = AppDataSource.getRepository(TASKS);
  private userRepository = AppDataSource.getRepository(ACCESS_MATRIX); // Still here if you need it for other checks
  private userRoleRepository = AppDataSource.getRepository(
    ACCESS_MATRIX_USR_ROLES
  );
  private rolePermRepository = AppDataSource.getRepository(
    ACCESS_MATRIX_ROLE_PERMS
  );
  private permissionRepository = AppDataSource.getRepository(
    ACCESS_MATRIX_PERMISSIONS
  ); // This one is not directly used by hasPermission but is part of the context

  // Helper to check if a user has a specific permission ID
  private hasPermission(
    userPermissions: number[],
    requiredPermissionId: number
  ): boolean {
    return userPermissions.includes(requiredPermissionId);
  }

  async getAllTasks(
    requestingUserId: number,
    userPermissions: number[]
  ): Promise<TASKS[]> {
    const canReadAllTasks = this.hasPermission(
      userPermissions,
      GLOBALVARS.READ_ALL_TASKS
    );
    console.log("userPermissions", userPermissions);

    if (!canReadAllTasks) {
      // If not allowed to read all, only return tasks created by this user
      return this.taskRepository.find({
        where: { IS_DELETED: false, CREATED_BY: requestingUserId },
        relations: ["createdBy"],
      });
    }

    // Otherwise, retrieve all non-deleted tasks
    return this.taskRepository.find({
      where: { IS_DELETED: false },
      relations: ["createdBy"],
    });
  }

  async getTaskById(
    id: number,
    requestingUserId: number,
    userPermissions: number[]
  ): Promise<TASKS | null> {
    const task = await this.taskRepository.findOne({
      where: { TASK_ID: id, IS_DELETED: false },
      relations: ["createdBy"],
    });

    if (!task) return null;

    // Authorization check: User must have 'Read Task' permission for specific task,
    // or 'Read_All_Tasks' to read all the tasks in the db itself.
    const canReadTask = this.hasPermission(
      userPermissions,
      GLOBALVARS.READ_TASK
    );
    const canReadAllTasks = this.hasPermission(
      userPermissions,
      GLOBALVARS.READ_ALL_TASKS
    );

    if (!canReadTask && !canReadAllTasks) {
      throw new Error("Unauthorized to read tasks."); // No general read permission
    }

    // If user can't read all tasks, they can only read their own
    if (!canReadAllTasks && task.CREATED_BY !== requestingUserId) {
      throw new Error("Unauthorized to read other users' tasks.");
    }

    return task;
  }

  async createTask(
    taskData: Partial<TASKS>,
    requestingUserId: number,
    userPermissions: number[]
  ): Promise<TASKS> {
    // Authorization check: User must have 'Create Task' permission
    const canCreateTask = this.hasPermission(
      userPermissions,
      GLOBALVARS.CREATE_TASK
    );
    if (!canCreateTask) {
      throw new Error("Unauthorized to create tasks.");
    }
    const newTask = this.taskRepository.create(taskData);
    return this.taskRepository.save(newTask);
  }

  async updateTask(
    id: number,
    taskData: Partial<TASKS>,
    requestingUserId: number,
    userPermissions: number[]
  ): Promise<TASKS | null> {
    // Originally would have prefered using versioning. so that able to retrieve back older tasks.
    const task = await this.taskRepository.findOne({
      where: { TASK_ID: id, IS_DELETED: false },
      relations: ["createdBy"],
    });
    if (!task) return null;

    // Authorization check: User must have 'Update Task' permission
    const canUpdateTask = this.hasPermission(
      userPermissions,
      GLOBALVARS.UPDATE_TASK
    );
    const canReadAllTasks = this.hasPermission(
      userPermissions,
      GLOBALVARS.READ_ALL_TASKS
    ); // Acting as Admin/Manager permission

    if (!canUpdateTask) {
      throw new Error("Unauthorized to update tasks.");
    }

    // Further authorization: If not 'admin' (Read_All_Tasks), user can only update their own task
    if (!canReadAllTasks && task.CREATED_BY !== requestingUserId) {
      throw new Error("Unauthorized to update other users' tasks.");
    }

    this.taskRepository.merge(task, taskData);
    return this.taskRepository.save(task);
  }

  async softDeleteTask(
    id: number,
    requestingUserId: number,
    userPermissions: number[]
  ): Promise<TASKS | null> {
    const task = await this.taskRepository.findOne({
      where: { TASK_ID: id, IS_DELETED: false },
      relations: ["createdBy"],
    });
    if (!task) return null;

    // Authorization check: User must have 'Delete Task' permission
    const canDeleteTask = this.hasPermission(
      userPermissions,
      GLOBALVARS.DELETE_TASK
    );
    const canReadAllTasks = this.hasPermission(
      userPermissions,
      GLOBALVARS.READ_ALL_TASKS
    ); // If you are admin, you should be able to view all the
    const adminRights = this.hasPermission(
      userPermissions,
      GLOBALVARS.ADMINISTRATOR_RIGHTS
    );
    if (!canDeleteTask) {
      throw new Error("Unauthorized to delete tasks.");
    }

    // Further authorization: If not 'admin' (Read_All_Tasks), user can only delete their own task.
    if (!adminRights && task.CREATED_BY !== requestingUserId) {
      throw new Error("Unauthorized to delete other users' tasks.");
    }

    task.IS_DELETED = true; // Set to true for soft-deleted
    task.DELETED_AT = new Date(); // Set deletion timestamp
    return this.taskRepository.save(task);
  }
}
