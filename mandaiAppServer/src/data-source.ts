// backend/src/data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { ACCESS_MATRIX } from "./entities/ACCESS_MATRIX";
import { ACCESS_MATRIX_ROLES } from "./entities/ACCESS_MATRIX_ROLES";
import { ACCESS_MATRIX_PERMISSIONS } from "./entities/ACCESS_MATRIX_PERMISSIONS";
import { ACCESS_MATRIX_USR_ROLES } from "./entities/ACCESS_MATRIX_USR_ROLES";
import { ACCESS_MATRIX_ROLE_PERMS } from "./entities/ACCESS_MATRIX_ROLE_PERMS";
import { TASKS } from "./entities/TASKS";

// For environment variables
import * as dotenv from "dotenv";
dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "your_mysql_root_password",
  database: process.env.DB_DATABASE || "task_management_mandai_db",
  synchronize: false, // Set to true ONLY FOR DEVELOPMENT with caution, migrations are better
  logging: false,
  entities: [
    ACCESS_MATRIX,
    ACCESS_MATRIX_ROLES,
    ACCESS_MATRIX_PERMISSIONS,
    ACCESS_MATRIX_USR_ROLES,
    ACCESS_MATRIX_ROLE_PERMS,
    TASKS,
  ],
  migrations: ["src/migration/**/*.ts"], // Point to your migration files
  subscribers: [],
});
