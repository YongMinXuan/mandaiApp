import React, { useState } from "react";
import { loginUser } from "../api/taskApi";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import AppTheme from "../theme/AppTheme";
import ColorModeSelect from "../theme/ColorModeSelect";
const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));
interface LoginProps {
  onLoginSuccess: () => void;
}

function Login(
  { onLoginSuccess }: LoginProps,
  props: { disableCustomTheme?: boolean }
) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    try {
      const data = await loginUser(username, password);
      localStorage.setItem("token", data.token); // Store the jwt token so that we can take it out and autheticate any users.
      onLoginSuccess(); // Notify parent component of successful login
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(
        err.response?.data?.message || "Login failed. Please check credentials."
      );
    }
  };

  // const validateInputs = () => {
  //   const email = document.getElementById("email") as HTMLInputElement;
  //   const password = document.getElementById("password") as HTMLInputElement;

  //   let isValid = true;

  //   if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
  //     setEmailError(true);
  //     setEmailErrorMessage("Please enter a valid email address.");
  //     isValid = false;
  //   } else {
  //     setEmailError(false);
  //     setEmailErrorMessage("");
  //   }

  //   if (!password.value || password.value.length < 6) {
  //     setPasswordError(true);
  //     setPasswordErrorMessage("Password must be at least 6 characters long.");
  //     isValid = false;
  //   } else {
  //     setPasswordError(false);
  //     setPasswordErrorMessage("");
  //   }

  //   return isValid;
  // };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <ColorModeSelect
          sx={{ position: "fixed", top: "1rem", right: "1rem", height: 42 }}
        />
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            Sign in
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="email">Username</FormLabel>
              <TextField
                id="outlined-basic"
                name="username"
                placeholder="username"
                autoFocus
                required
                fullWidth
                onChange={(e) => setUsername(e.target.value)}
                // variant="outlined"
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
                fullWidth
                variant="outlined"
              />
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={handleSubmit}
            >
              Sign in
            </Button>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
    // <div
    //   style={{
    //     padding: "20px",
    //     fontFamily: "Arial, sans-serif",
    //     maxWidth: "400px",
    //     margin: "50px auto",
    //     border: "1px solid #ccc",
    //     borderRadius: "8px",
    //     boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    //   }}
    // >
    //   <h2>Login</h2>
    //   {error && <p style={{ color: "red" }}>{error}</p>}
    //   <form onSubmit={handleSubmit}>
    //     <div style={{ marginBottom: "15px" }}>
    //       <label
    //         htmlFor="username"
    //         style={{ display: "block", marginBottom: "5px" }}
    //       >
    //         Username:
    //       </label>
    //       <input
    //         type="text"
    //         id="username"
    //         value={username}
    //         onChange={(e) => setUsername(e.target.value)}
    //         required
    //         style={{
    //           width: "100%",
    //           padding: "8px",
    //           border: "1px solid #ddd",
    //           borderRadius: "4px",
    //         }}
    //       />
    //     </div>
    //     <div style={{ marginBottom: "15px" }}>
    //       <label
    //         htmlFor="password"
    //         style={{ display: "block", marginBottom: "5px" }}
    //       >
    //         Password:
    //       </label>
    //       <input
    //         type="password"
    //         id="password"
    //         value={password}
    //         onChange={(e) => setPassword(e.target.value)}
    //         required
    //         style={{
    //           width: "100%",
    //           padding: "8px",
    //           border: "1px solid #ddd",
    //           borderRadius: "4px",
    //         }}
    //       />
    //     </div>
    //     <button
    //       type="submit"
    //       style={{
    //         width: "100%",
    //         padding: "10px",
    //         backgroundColor: "#007bff",
    //         color: "white",
    //         border: "none",
    //         borderRadius: "5px",
    //         cursor: "pointer",
    //         fontSize: "16px",
    //       }}
    //     >
    //       Login
    //     </button>
    //   </form>
    // </div>
  );
}

export default Login;
