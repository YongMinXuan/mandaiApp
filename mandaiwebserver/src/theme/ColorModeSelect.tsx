import * as React from "react";
import { useColorScheme } from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectProps } from "@mui/material/Select";

export default function ColorModeSelect(props: SelectProps) {
  const { mode, setMode } = useColorScheme();
  if (!mode) {
    return null;
  }
  return (
    <Select
      sx={{ height: 42 }}
      value={mode}
      onChange={(event) => setMode(event.target.value as "light" | "dark")}
      SelectDisplayProps={{
        // @ts-ignore
        "data-screenshot": "toggle-mode",
      }}
      {...props}
    >
      {/* <MenuItem value="system">System</MenuItem> */}
      <MenuItem value="light">Light</MenuItem>
      <MenuItem value="dark">Dark</MenuItem>
    </Select>
  );
}
