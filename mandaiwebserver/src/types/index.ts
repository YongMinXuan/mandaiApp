export interface User {
  ACCESS_ID: number;
  USERNAME: string;
  EMAIL: string | null;
  IS_ACTIVE: boolean;
  UPDATED_AT: string;
}

export interface Task {
  TASK_ID: number;
  TITLE: string;
  DESCRIPTION: string | null;
  STATUS: "pending" | "in-progress" | "completed" | "blocked";
  CREATED_BY: number | null;
  UPDATED_AT: string;
  IS_DELETED: boolean;
  DELETED_AT: string | null;
  createdBy?: User;
}

export interface CreateTaskDto {
  TITLE: string;
  DESCRIPTION?: string;
  STATUS?: "pending" | "in-progress" | "completed" | "blocked";
  CREATED_BY: number;
}

export interface UpdateTaskDto {
  TITLE?: string;
  DESCRIPTION?: string | null;
  STATUS?: "pending" | "in-progress" | "completed" | "blocked";
}
