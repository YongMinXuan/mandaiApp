import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ACCESS_MATRIX_ROLES } from "./ACCESS_MATRIX_ROLES";
import { ACCESS_MATRIX } from "./ACCESS_MATRIX";
@Entity("ACCESS_MATRIX_USR_ROLES")
export class ACCESS_MATRIX_USR_ROLES {
  @PrimaryGeneratedColumn({ name: "USER_ROLE_ID" })
  USER_ROLE_ID!: number;

  @Column({ name: "ACCESS_ID" })
  ACCESS_ID!: number;

  @Column({ name: "ROLE_ID" })
  ROLE_ID!: number;

  @UpdateDateColumn({ name: "UPDATED_AT", type: "timestamp" })
  UPDATED_AT!: Date;

  // Relationships
  @ManyToOne(() => ACCESS_MATRIX, (user) => user.userRoles, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "ACCESS_ID" })
  user!: ACCESS_MATRIX;

  @ManyToOne(() => ACCESS_MATRIX_ROLES, (role) => role.userRoles, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "ROLE_ID" })
  role!: ACCESS_MATRIX_ROLES;
}
