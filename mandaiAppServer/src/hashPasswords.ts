import { AuthService } from "./services/authService";

async function hashAndLogPasswords() {
  const authService = new AuthService();
  console.log(
    "Admin password hash:",
    await authService.hashPassword("adminpass")
  ); // Replace 'adminpass'
  console.log(
    "User password hash:",
    await authService.hashPassword("userpass")
  ); // Replace 'userpass'
}

hashAndLogPasswords();
