import { AppDataSource } from "../data-source";
import { ACCESS_MATRIX } from "../entities/ACCESS_MATRIX";
// Import all necessary entities for permission fetching via joins
import { ACCESS_MATRIX_USR_ROLES } from "../entities/ACCESS_MATRIX_USR_ROLES";
import { ACCESS_MATRIX_ROLE_PERMS } from "../entities/ACCESS_MATRIX_ROLE_PERMS";
import { ACCESS_MATRIX_PERMISSIONS } from "../entities/ACCESS_MATRIX_PERMISSIONS";

import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

export class AuthService {
  private userRepository = AppDataSource.getRepository(ACCESS_MATRIX);
  private userRoleRepository = AppDataSource.getRepository(
    ACCESS_MATRIX_USR_ROLES
  );
  private rolePermRepository = AppDataSource.getRepository(
    ACCESS_MATRIX_ROLE_PERMS
  );
  // private permissionRepository = AppDataSource.getRepository(ACCESS_MATRIX_PERMISSIONS); // Not directly used here, but part of setup

  private jwtSecret = process.env.JWT_SECRET || "supersecretjwtkey";

  async login(
    username: string,
    password_plain: string
  ): Promise<string | null> {
    const user = await this.userRepository.findOneBy({ USERNAME: username });

    if (!user) {
      return null; // User not found or inactive
    }

    const isPasswordValid = await bcrypt.compare(password_plain, user.PW_HASH);

    if (!isPasswordValid) {
      return null; // Invalid credentials
    }

    // NEW: Fetch user's roles and permissions using QueryBuilder with LEFT JOINs to get PERMISSION_IDs
    const userPermissionsResult = await AppDataSource.getRepository(
      ACCESS_MATRIX
    )
      .createQueryBuilder("user")
      .leftJoin("user.userRoles", "userRole") // Join user to userRoles
      .leftJoin("userRole.role", "role") // Join userRoles to roles
      .leftJoin("role.rolePermissions", "rolePerm") // Join roles to rolePermissions
      .leftJoin("rolePerm.permission", "permission") // Join rolePermissions to permissions
      .where("user.ACCESS_ID = :id", { id: user.ACCESS_ID })
      .select([
        "*", // Select the permission ID
      ])
      .getRawMany(); // Get raw results because we just want specific columns (flat structure)

    // For debugging: log the raw result

    const userPermissions: number[] = []; // Array of numbers (permission IDs)
    for (const row of userPermissionsResult) {
      // Ensure permission ID exists and is not already added

      if (row.PERMISSION_ID && !userPermissions.includes(row.PERMISSION_ID)) {
        userPermissions.push(row.PERMISSION_ID);
      }
    }

    // Generate JWT Token - INCLUDING PERMISSION IDs
    const token = jwt.sign(
      {
        ACCESS_ID: user.ACCESS_ID,
        USERNAME: user.USERNAME,
        permissions: userPermissions,
      }, // UPDATED PAYLOAD: permissions is number[]
      this.jwtSecret,
      { expiresIn: "1h" }
    );

    return token;
  }

  async hashPassword(password_plain: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password_plain, salt);
    return hash;
  }
}
