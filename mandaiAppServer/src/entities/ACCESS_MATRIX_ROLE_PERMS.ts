import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ACCESS_MATRIX_ROLES } from "./ACCESS_MATRIX_ROLES";
import { ACCESS_MATRIX_PERMISSIONS } from "./ACCESS_MATRIX_PERMISSIONS";

@Entity("ACCESS_MATRIX_ROLE_PERMS")
export class ACCESS_MATRIX_ROLE_PERMS {
  @PrimaryGeneratedColumn({ name: "ROLE_PERMISSION_ID" })
  ROLE_PERMISSION_ID!: number;

  @Column({ name: "ROLE_ID" })
  ROLE_ID!: number;

  @Column({ name: "PERMISSION_ID" })
  PERMISSION_ID!: number;

  @UpdateDateColumn({ name: "UPDATED_AT", type: "timestamp" })
  UPDATED_AT!: Date;

  // Relationships
  @ManyToOne(() => ACCESS_MATRIX_ROLES, (role) => role.rolePermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "ROLE_ID" })
  role!: ACCESS_MATRIX_ROLES;

  @ManyToOne(
    () => ACCESS_MATRIX_PERMISSIONS,
    (permission) => permission.rolePermissions,
    { onDelete: "CASCADE" }
  )
  @JoinColumn({ name: "PERMISSION_ID" })
  permission!: ACCESS_MATRIX_PERMISSIONS;
}
