import "reflect-metadata";
import app from "./app";
import * as dotenv from "dotenv";
dotenv.config();
import { AuthService } from "./services/authService";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access API at http://localhost:${PORT}/api`);
  console.log(`Server is up and ready`);
});
