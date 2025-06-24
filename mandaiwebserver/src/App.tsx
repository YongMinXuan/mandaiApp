// frontend/src/App.tsx
import React, { useState, useEffect } from "react";
import { Task, CreateTaskDto, UpdateTaskDto } from "./types";
import { getTasks, createTask, updateTask, deleteTask } from "./api/taskApi";
import Login from "./components/Login";
import { jwtDecode } from "jwt-decode";
import { GLOBALVARS } from "./globalvariable/globalvariable";
import AppTheme from "../src/theme/AppTheme";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import ColorModeSelect from "../src/theme/ColorModeSelect";
import {
  AppBar,
  Button,
  FormControl,
  TextField,
  Toolbar,
  useTheme,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
};
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

function App(props: { disableCustomTheme?: boolean }) {
  const theme = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newTaskDescription, setNewTaskDescription] = useState<string>("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUserPermissions, setCurrentUserPermissions] = useState<
    number[]
  >([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [open, setOpen] = React.useState(false);
  const handleOpenCreate = () => setOpen(true);
  const handleCloseCreate = () => {
    setNewTaskTitle("");
    setNewTaskDescription("");
    setOpen(false);
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken: {
          ACCESS_ID: number;
          USERNAME: string;
          permissions: number[];
        } = jwtDecode(token);
        setIsAuthenticated(true);

        setCurrentUserPermissions(decodedToken.permissions || []); // Store permissions

        setCurrentUserId(decodedToken.ACCESS_ID);
        fetchTasks(decodedToken.permissions); // Make sure that the user has the correct permissions
      } catch (error) {
        handleLogout(); // Log out if token is invalid
      }
    }
  }, []);

  const handleLoginSuccess = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken: {
          ACCESS_ID: number;
          USERNAME: string;
          permissions: number[];
        } = jwtDecode(token);
        setIsAuthenticated(true);
        setCurrentUserPermissions(decodedToken.permissions || []); // Store permissions
        setCurrentUserId(decodedToken.ACCESS_ID);
        fetchTasks(decodedToken.permissions); // Fetch tasks after login
      } catch (error) {
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setCurrentUserPermissions([]); // Clear permissions on logout
    setCurrentUserId(null);
    setTasks([]);
    setEditingTask(null);
  };

  // Helper function to check if current user has a specific permission ID
  const hasPermission = (permissionId: number): boolean => {
    return currentUserPermissions.includes(permissionId);
  };

  const fetchTasks = async (permissions: number[] = currentUserPermissions) => {
    try {
      if (
        !permissions.includes(GLOBALVARS.READ_TASK) &&
        !permissions.includes(GLOBALVARS.READ_ALL_TASKS)
      ) {
        setTasks([]); // cannot read anything
        return;
      }
      const data = await getTasks();
      if (!permissions.includes(GLOBALVARS.READ_ALL_TASKS) && currentUserId) {
        setTasks(data.filter((task) => task.CREATED_BY === currentUserId));
      } else {
        setTasks(data);
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("Session expired or unauthorized. Please log in again.");
        handleLogout();
      } else {
        alert("Failed to load tasks.");
      }
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      alert("Task title cannot be empty!");
      return;
    }
    if (!hasPermission(GLOBALVARS.CREATE_TASK)) {
      alert("You do not have permission to create tasks.");
      return;
    }

    try {
      const newTaskData: CreateTaskDto = {
        TITLE: newTaskTitle,
        DESCRIPTION: newTaskDescription,
        STATUS: "pending",
        CREATED_BY: currentUserId || 0,
      };
      await createTask(newTaskData);
      setNewTaskTitle("");
      setNewTaskDescription("");
      fetchTasks();
      handleCloseCreate();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create task.");
    }
  };

  const handleEditClick = (task: Task) => {
    if (!hasPermission(GLOBALVARS.UPDATE_TASK)) {
      alert("You do not have permission to update tasks.");
      return;
    }
    if (
      !hasPermission(GLOBALVARS.READ_ALL_TASKS) &&
      task.CREATED_BY !== currentUserId
    ) {
      alert("You can only update your own tasks.");
      return;
    }
    setEditingTask({ ...task });
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.TITLE.trim()) {
      alert("Task title cannot be empty!");
      return;
    }
    if (!hasPermission(GLOBALVARS.UPDATE_TASK)) {
      alert("You do not have permission to update tasks.");
      return;
    }

    try {
      const updateData: UpdateTaskDto = {
        TITLE: editingTask.TITLE,
        DESCRIPTION: editingTask.DESCRIPTION,
        STATUS: editingTask.STATUS,
      };
      await updateTask(editingTask.TASK_ID, updateData);
      setEditingTask(null);
      fetchTasks();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update task.");
    }
  };

  const handleDeleteTask = async (
    taskId: number,
    taskCreatorId: number | null
  ) => {
    if (!hasPermission(GLOBALVARS.DELETE_TASK)) {
      return;
    }
    if (
      !hasPermission(GLOBALVARS.READ_ALL_TASKS) &&
      taskCreatorId !== currentUserId
    ) {
      alert("You can only delete your own tasks.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this task?")) {
      // deleting here will only be a soft-delete. the task will still be viewable in the database
      try {
        await deleteTask(taskId);
        fetchTasks();
      } catch (error: any) {
        alert(error.response?.data?.message || "Failed to soft-delete task.");
      }
    }
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {" "}
      <AppTheme {...props}>
        <AppBar position="static" color="transparent">
          <Toolbar sx={{ justifyContent: "space-between" }}>
            {hasPermission(GLOBALVARS.CREATE_TASK) && (
              <Button
                variant="contained"
                color="success"
                onClick={() => handleOpenCreate()} // Open modal on click
                sx={{ color: "white" }}
              >
                Create Tasks
              </Button>
            )}

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {" "}
              <ColorModeSelect />
              <Button
                variant="contained"
                color="error"
                onClick={handleLogout}
                sx={{ ml: 1 }}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Modal
          open={open}
          onClose={() => handleCloseCreate()}
          aria-labelledby="create-task-modal-title"
          aria-describedby="create-task-modal-description"
        >
          <Box sx={style}>
            <Typography
              id="create-task-modal-title"
              variant="h6"
              component="h2"
              sx={{ mb: 2 }}
            >
              Create your tasks
            </Typography>
            <form onSubmit={handleCreateTask}>
              <TextField
                fullWidth
                id="newTaskTitle"
                label="Title"
                variant="outlined"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
                sx={{ mb: 2 }} // Margin bottom for spacing
              />
              <TextField
                fullWidth
                id="newTaskDescription"
                label="Description"
                multiline
                minRows={3}
                maxRows={10}
                variant="outlined"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                color="success"
                sx={{ mr: 1 }}
              >
                Add Task
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleCloseCreate()}
              >
                Cancel
              </Button>
            </form>
          </Box>
        </Modal>
        <Box sx={{ padding: "20px" }}>
          {" "}
          <Typography
            variant="h5"
            component="h2"
            sx={{ textAlign: "center", marginBottom: 2 }}
          >
            My Tasks
          </Typography>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {tasks.length === 0 &&
            (hasPermission(GLOBALVARS.READ_TASK) ||
              hasPermission(GLOBALVARS.READ_ALL_TASKS)) ? (
              <Typography
                component="p"
                color="text.secondary"
                sx={{ textAlign: "center" }}
              >
                No tasks found. Create one above or check your permissions.
              </Typography>
            ) : tasks.length === 0 ? (
              <Typography
                component="p"
                color="error"
                sx={{ textAlign: "center" }}
              >
                You do not have permission to view tasks. Please contact an
                administrator.
              </Typography>
            ) : (
              tasks.map((task) => (
                <li
                  key={task.TASK_ID}
                  style={{
                    marginBottom: theme.spacing(2),
                  }}
                >
                  <MuiCard
                    variant="outlined"
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignSelf: "center",
                      width: "100%",
                      padding: theme.spacing(2),
                      gap: theme.spacing(1),
                      boxShadow:
                        task.IS_DELETED === true
                          ? "none"
                          : "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px",
                      backgroundColor:
                        task.IS_DELETED === true
                          ? theme.palette.action.disabledBackground
                          : theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      opacity: task.IS_DELETED === true ? 0.7 : 1,
                    }}
                  >
                    {editingTask && editingTask.TASK_ID === task.TASK_ID ? (
                      // Editing form for task
                      <form onSubmit={handleUpdateTask}>
                        <TextField
                          fullWidth
                          label="Title"
                          variant="outlined"
                          value={editingTask.TITLE}
                          onChange={(e) =>
                            setEditingTask({
                              ...editingTask,
                              TITLE: e.target.value,
                            })
                          }
                          required
                          sx={{ mb: 1 }}
                        />
                        <TextField
                          fullWidth
                          label="Description"
                          multiline
                          rows={2}
                          value={editingTask.DESCRIPTION || ""}
                          onChange={(e) =>
                            setEditingTask({
                              ...editingTask,
                              DESCRIPTION: e.target.value,
                            })
                          }
                          sx={{ mb: 1 }}
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <select
                            value={editingTask.STATUS}
                            onChange={(e) =>
                              setEditingTask({
                                ...editingTask,
                                STATUS: e.target.value as any,
                              })
                            }
                            style={{
                              padding: "8px",
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: "4px",
                              backgroundColor: theme.palette.background.default,
                              color: theme.palette.text.primary,
                              width: "100%",
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In-Progress</option>
                            <option value="completed">Completed</option>
                            <option value="blocked">Blocked</option>
                          </select>
                        </FormControl>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          sx={{ mr: 1 }}
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="outlined"
                          color="error"
                          onClick={() => setEditingTask(null)}
                        >
                          Cancel
                        </Button>
                      </form>
                    ) : (
                      // Display task details
                      <Box>
                        <Typography
                          variant="h6"
                          component="h3"
                          color="text.secondary"
                        >
                          {task.TITLE} {task.IS_DELETED === true && "(DELETED)"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Description: {task.DESCRIPTION || "N/A"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Status: {task.STATUS}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Created by:{" "}
                          {task.createdBy?.USERNAME || "Unknown User"}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          Last Updated:{" "}
                          {new Date(task.UPDATED_AT).toLocaleString()}
                        </Typography>
                        {task.IS_DELETED === false && (
                          <Box sx={{ mt: 1 }}>
                            {/* Show Edit button only if user has permission AND can edit THIS task */}
                            {hasPermission(GLOBALVARS.UPDATE_TASK) &&
                              (hasPermission(GLOBALVARS.READ_ALL_TASKS) ||
                                task.CREATED_BY === currentUserId) && (
                                <Button
                                  variant="outlined"
                                  color="warning"
                                  onClick={() => handleEditClick(task)}
                                  sx={{ mr: 1 }}
                                >
                                  Edit
                                </Button>
                              )}
                            {/* Show Delete button only if user has permission AND can delete THIS task */}
                            {hasPermission(GLOBALVARS.DELETE_TASK) &&
                              (hasPermission(GLOBALVARS.READ_ALL_TASKS) ||
                                task.CREATED_BY === currentUserId) && (
                                <Button
                                  variant="outlined"
                                  color="error"
                                  onClick={() =>
                                    handleDeleteTask(
                                      task.TASK_ID,
                                      task.CREATED_BY
                                    )
                                  }
                                >
                                  Delete
                                </Button>
                              )}
                          </Box>
                        )}
                      </Box>
                    )}
                  </MuiCard>{" "}
                </li>
              ))
            )}
          </ul>
        </Box>
      </AppTheme>
    </Box>
  );
}

export default App;
