import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ACCESS_MATRIX_ROLE_PERMS } from "./ACCESS_MATRIX_ROLE_PERMS";

@Entity("ACCESS_MATRIX_PERMISSIONS")
export class ACCESS_MATRIX_PERMISSIONS {
  @PrimaryGeneratedColumn({ name: "PERMISSION_ID" })
  PERMISSION_ID!: number;

  @Column({
    name: "PERMISSION_NAME",
    type: "varchar",
    length: 100,
    unique: true,
  })
  PERMISSION_NAME!: string;

  @Column({ name: "DESCRIPTION", type: "text", nullable: true })
  DESCRIPTION!: string | null;

  @UpdateDateColumn({ name: "UPDATED_AT", type: "timestamp" })
  UPDATED_AT!: Date;

  // Relationship
  @OneToMany(() => ACCESS_MATRIX_ROLE_PERMS, (rolePerm) => rolePerm.permission)
  rolePermissions!: ACCESS_MATRIX_ROLE_PERMS[];
}
