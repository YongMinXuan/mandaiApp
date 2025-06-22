import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ACCESS_MATRIX_USR_ROLES } from "./ACCESS_MATRIX_USR_ROLES";
import { TASKS } from "./TASKS";

@Entity("ACCESS_MATRIX")
export class ACCESS_MATRIX {
  @PrimaryGeneratedColumn({ name: "ACCESS_ID" })
  ACCESS_ID!: number;

  @Column({ name: "USERNAME", type: "varchar", length: 255, unique: true })
  USERNAME!: string;

  @Column({ name: "PW_HASH", type: "varchar", length: 255 })
  PW_HASH!: string;

  @Column({
    name: "EMAIL",
    type: "varchar",
    length: 255,
    unique: true,
    nullable: true,
  })
  EMAIL!: string | null;

  @UpdateDateColumn({ name: "UPDATED_AT", type: "timestamp" })
  UPDATED_AT!: Date;

  // Relationships
  @OneToMany(() => ACCESS_MATRIX_USR_ROLES, (userRole) => userRole.user)
  userRoles!: ACCESS_MATRIX_USR_ROLES[];

  @OneToMany(() => TASKS, (task) => task.createdBy)
  tasksCreated!: TASKS[];
}
