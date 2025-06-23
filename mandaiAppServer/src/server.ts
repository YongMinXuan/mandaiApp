import "reflect-metadata";
import app from "./app";
import * as dotenv from "dotenv";
dotenv.config();
import { AuthService } from "./services/authService";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  hashAndLogPasswords();
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access API at http://localhost:${PORT}/api`);
  // console.log(`crypt here`, require("crypto").randomBytes(64).toString("hex"));
});

async function hashAndLogPasswords() {
  const authService = new AuthService();
  console.log(
    "Admin password hash:",
    await authService.hashPassword("adminpass")
  ); // Replace 'adminpass'
  console.log(
    "User password hash:",
    await authService.hashPassword("P@ssw0rd1")
  ); // Replace 'userpass'
}
