import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ACCESS_MATRIX_USR_ROLES } from "./ACCESS_MATRIX_USR_ROLES";
import { ACCESS_MATRIX_ROLE_PERMS } from "./ACCESS_MATRIX_ROLE_PERMS";

@Entity("ACCESS_MATRIX_ROLES")
export class ACCESS_MATRIX_ROLES {
  @PrimaryGeneratedColumn({ name: "ROLE_ID" })
  ROLE_ID!: number;

  @Column({ name: "ROLE_NAME", type: "varchar", length: 100, unique: true })
  ROLE_NAME!: string;

  @Column({ name: "DESCRIPTION", type: "text", nullable: true })
  DESCRIPTION!: string | null;

  @UpdateDateColumn({ name: "UPDATED_AT", type: "timestamp" })
  UPDATED_AT!: Date;

  // Relationships
  @OneToMany(() => ACCESS_MATRIX_USR_ROLES, (userRole) => userRole.role)
  userRoles!: ACCESS_MATRIX_USR_ROLES[];

  @OneToMany(() => ACCESS_MATRIX_ROLE_PERMS, (rolePerm) => rolePerm.role)
  rolePermissions!: ACCESS_MATRIX_ROLE_PERMS[];
}
