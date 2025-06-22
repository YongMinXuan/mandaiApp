import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ValueTransformer,
} from "typeorm";
import { ACCESS_MATRIX } from "./ACCESS_MATRIX";

// Define a custom transformer for boolean to TINYINT(1)
const booleanToTinyIntTransformer: ValueTransformer = {
  from: (databaseValue: number | null): boolean | null => {
    if (databaseValue === null) {
      return null;
    }
    return databaseValue === 1; // Convert 1 to true, 0 to false
  },
  to: (entityValue: boolean | null): number | null => {
    if (entityValue === null) {
      return null;
    }
    return entityValue ? 1 : 0; // Convert true to 1, false to 0
  },
};
@Entity("TASKS")
export class TASKS {
  @PrimaryGeneratedColumn({ name: "TASK_ID" })
  TASK_ID!: number;

  @Column({ name: "TITLE", type: "varchar", length: 255 })
  TITLE!: string;

  @Column({ name: "DESCRIPTION", type: "text", nullable: true })
  DESCRIPTION!: string | null;

  @Column({
    name: "STATUS",
    type: "enum",
    enum: ["pending", "in-progress", "completed", "blocked"],
    default: "pending",
  })
  STATUS!: "pending" | "in-progress" | "completed" | "blocked";

  @Column({ name: "CREATED_BY", type: "int", nullable: true })
  CREATED_BY!: number | null;

  @UpdateDateColumn({ name: "UPDATED_AT", type: "timestamp" })
  UPDATED_AT!: Date;

  @Column({
    name: "IS_DELETED",
    type: "tinyint", // Use tinyint directly for 0/1 storage
    default: 0, // Default to 0 (false)
    transformer: booleanToTinyIntTransformer, // Apply the transformer
  })
  IS_DELETED!: boolean; // Still use boolean in your entity

  @Column({ name: "DELETED_AT", type: "timestamp", nullable: true })
  DELETED_AT!: Date | null;

  // Relationship
  @ManyToOne(() => ACCESS_MATRIX, (user) => user.tasksCreated, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "CREATED_BY" })
  createdBy!: ACCESS_MATRIX;
}
