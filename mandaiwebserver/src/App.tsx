// frontend/src/App.tsx
import React, { useState, useEffect } from "react";
import { Task, CreateTaskDto, UpdateTaskDto } from "./types";
import { getTasks, createTask, updateTask, deleteTask } from "./api/taskApi";
import Login from "./components/Login";
import { jwtDecode } from "jwt-decode"; // for decoding JWT (install: npm install jwt-decode)
import { GLOBALVARS } from "./globalvariable/globalvariable"; // NEW: Import permission constants
import AppTheme from "../src/theme/AppTheme";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import ColorModeSelect from "../src/theme/ColorModeSelect";
import { Button, FormControl, TextField } from "@mui/material";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
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
// IMPORTANT: Install jwt-decode library for decoding the token on the frontend
// npm install jwt-decode

function App(props: { disableCustomTheme?: boolean }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newTaskDescription, setNewTaskDescription] = useState<string>("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUserPermissions, setCurrentUserPermissions] = useState<
    number[]
  >([]); // UPDATED: Store user permissions as numbers
  const [currentUserId, setCurrentUserId] = useState<number | null>(null); // Store current user ID
  const [open, setOpen] = React.useState(false);
  const handleOpenCreate = () => setOpen(true);
  const handleCloseCreate = () => setOpen(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // UPDATED: Decode permissions from JWT (now numbers)
        const decodedToken: {
          ACCESS_ID: number;
          USERNAME: string;
          permissions: number[];
        } = jwtDecode(token);
        setIsAuthenticated(true);
        console.log("decodedToken", decodedToken);
        setCurrentUserPermissions(decodedToken.permissions || []); // Store permissions
        console.log("currentUserPermissions", currentUserPermissions);
        setCurrentUserId(decodedToken.ACCESS_ID);
        fetchTasks(decodedToken.permissions); // Pass permissions to fetchTasks
      } catch (error) {
        console.error("Failed to decode token:", error);
        handleLogout(); // Log out if token is invalid
      }
    }
  }, []);

  const handleLoginSuccess = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // UPDATED: Decode permissions from JWT (now numbers)
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
        console.error("Login success, but token decode failed:", error);
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
    alert("Logged out successfully.");
  };

  // Helper function to check if current user has a specific permission ID
  const hasPermission = (permissionId: number): boolean => {
    return currentUserPermissions.includes(permissionId);
  };

  const fetchTasks = async (permissions: number[] = currentUserPermissions) => {
    // Receive permissions as parameter
    try {
      // Frontend check: User must have 'Read Task' or 'Read_All_Tasks' to even attempt fetching
      if (
        !permissions.includes(GLOBALVARS.READ_TASK) &&
        !permissions.includes(GLOBALVARS.READ_ALL_TASKS)
      ) {
        setTasks([]); // Clear tasks if not authorized to read anything
        return;
      }
      const data = await getTasks();
      // Client-side filter: If user doesn't have 'Read_All_Tasks', only show their own tasks
      if (!permissions.includes(GLOBALVARS.READ_ALL_TASKS) && currentUserId) {
        setTasks(data.filter((task) => task.CREATED_BY === currentUserId));
      } else {
        setTasks(data);
      }
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
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
      // Frontend check before API call using ID
      alert("You do not have permission to create tasks.");
      return;
    }

    try {
      const newTaskData: CreateTaskDto = {
        TITLE: newTaskTitle,
        DESCRIPTION: newTaskDescription,
        STATUS: "pending",
        CREATED_BY: currentUserId || 0, // Frontend sends creator ID, backend verifies
      };
      await createTask(newTaskData);
      setNewTaskTitle("");
      setNewTaskDescription("");
      fetchTasks(); // Refresh the list
      //alert("Task created successfully!");
      handleCloseCreate();
    } catch (error: any) {
      console.error("Error creating task:", error);
      alert(error.response?.data?.message || "Failed to create task.");
    }
  };

  const handleEditClick = (task: Task) => {
    // Frontend check: Can user update tasks in general?
    if (!hasPermission(GLOBALVARS.UPDATE_TASK)) {
      // Check using ID
      alert("You do not have permission to update tasks.");
      return;
    }
    // Frontend check: Can user update THIS specific task (only their own unless admin-like)
    if (
      !hasPermission(GLOBALVARS.READ_ALL_TASKS) &&
      task.CREATED_BY !== currentUserId
    ) {
      // Check using ID for Read_All_Tasks
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
    // Re-check permissions before API call (good practice)
    if (!hasPermission(GLOBALVARS.UPDATE_TASK)) {
      // Check using ID
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
      alert("Task updated successfully!");
    } catch (error: any) {
      console.error("Error updating task:", error);
      alert(error.response?.data?.message || "Failed to update task.");
    }
  };

  const handleDeleteTask = async (
    taskId: number,
    taskCreatorId: number | null
  ) => {
    // Added taskCreatorId to check ownership
    // Frontend check: Can user delete tasks in general?
    if (!hasPermission(GLOBALVARS.DELETE_TASK)) {
      // Check using ID
      alert("You do not have permission to delete tasks.");
      return;
    }
    // Frontend check: Can user delete THIS specific task (only their own unless admin-like)
    if (
      !hasPermission(GLOBALVARS.READ_ALL_TASKS) &&
      taskCreatorId !== currentUserId
    ) {
      // Check using ID for Read_All_Tasks
      alert("You can only delete your own tasks.");
      return;
    }

    if (window.confirm("Are you sure you want to soft-delete this task?")) {
      try {
        await deleteTask(taskId);
        fetchTasks();
        alert("Task soft-deleted successfully!");
      } catch (error: any) {
        console.error("Error deleting task:", error);
        alert(error.response?.data?.message || "Failed to soft-delete task.");
      }
    }
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <AppTheme {...props}>
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        {hasPermission(GLOBALVARS.CREATE_TASK) && ( // Check using ID
          <>
            {/* <h2>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div style={{ marginBottom: "10px" }}>
                <label htmlFor="title">Title:</label>
                <input
                  type="text"
                  id="title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                  style={{
                    width: "calc(100% - 100px)",
                    padding: "8px",
                    marginLeft: "10px",
                  }}
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  rows={3}
                  style={{
                    width: "calc(100% - 100px)",
                    padding: "8px",
                    marginLeft: "10px",
                  }}
                ></textarea>
              </div>
              <Button
                type="submit"
                style={{
                  padding: "10px 15px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Add Task
              </Button>
            </form> */}

            <div>
              <Button
                style={{
                  padding: "8px 15px",
                  backgroundColor: "#00973d",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  position: "fixed",
                  top: "1rem",
                  left: "1rem",
                }}
                onClick={handleOpenCreate}
              >
                Create Tasks
              </Button>
              <Modal
                open={open}
                onClose={handleCloseCreate}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <Box sx={style}>
                  <Typography
                    id="modal-modal-title"
                    variant="h6"
                    component="h2"
                  >
                    Create your tasks
                  </Typography>
                  <form onSubmit={handleCreateTask}>
                    <div style={{ marginBottom: "10px" }}>
                      <label htmlFor="title">Title:</label>
                      <input
                        type="text"
                        id="title"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        required
                        style={{
                          width: "calc(100% - 100px)",
                          padding: "8px",
                          marginLeft: "10px",
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <label htmlFor="description">Description:</label>
                      <textarea
                        id="description"
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        rows={3}
                        style={{
                          width: "calc(100% - 50px)",
                          height: "calc(100% - 50px)",

                          padding: "8px",
                          //marginLeft: "10px",
                        }}
                      ></textarea>
                    </div>
                    <Button
                      type="submit"
                      style={{
                        padding: "10px 15px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Add Task
                    </Button>
                  </form>
                </Box>
              </Modal>
            </div>
          </>
        )}
        <ColorModeSelect
          sx={{ position: "fixed", top: "1rem", right: "6rem" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          {/* <h1>Task Management App</h1> */}
          <Button
            onClick={handleLogout}
            style={{
              padding: "8px 15px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              position: "fixed",
              top: "1rem",
              right: "1rem",
            }}
          >
            Logout
          </Button>
        </div>
        {/* Task Creation Form - only visible if user has 'Create Task' permission */}
        {/* Task List */}
        <Typography
          variant="h2"
          component="h2"
          sx={{ textAlign: "center", marginBottom: 2 }}
        >
          My Tasks{" "}
        </Typography>{" "}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tasks.length === 0 &&
          (hasPermission(GLOBALVARS.READ_TASK) ||
            hasPermission(GLOBALVARS.READ_ALL_TASKS)) ? ( // Check using IDs
            <p>No tasks found. Create one above or check your permissions.</p>
          ) : tasks.length === 0 ? (
            <p>
              You do not have permission to view tasks. Please contact an
              administrator.
            </p>
          ) : (
            tasks.map((task: Task) => (
              <li
                key={task.TASK_ID}
                style={{
                  marginBottom: "2rem",
                  //backgroundColor: task.IS_DELETED === true ? "#fdd" : "#fff", // Highlight soft-deleted tasks (boolean)
                }}
              >
                <Card variant="outlined">
                  {editingTask &&
                  editingTask.TASK_ID === task.TASK_ID &&
                  hasPermission(GLOBALVARS.UPDATE_TASK) ? (
                    // Editing form for task
                    <form onSubmit={handleUpdateTask}>
                      <input
                        type="text"
                        value={editingTask.TITLE}
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            TITLE: e.target.value,
                          })
                        }
                        required
                        style={{
                          width: "100%",
                          padding: "8px",
                          marginBottom: "8px",
                        }}
                      />
                      <textarea
                        value={editingTask.DESCRIPTION || ""}
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            DESCRIPTION: e.target.value,
                          })
                        }
                        rows={2}
                        style={{
                          width: "100%",
                          padding: "8px",
                          marginBottom: "8px",
                        }}
                      ></textarea>
                      <select
                        value={editingTask.STATUS}
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            STATUS: e.target.value as any,
                          })
                        }
                        style={{ padding: "8px", marginRight: "8px" }}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In-Progress</option>
                        <option value="completed">Completed</option>
                        <option value="blocked">Blocked</option>
                      </select>
                      <Button
                        type="submit"
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          marginRight: "5px",
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setEditingTask(null)}
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </Button>
                    </form>
                  ) : (
                    // Display task details
                    <div>
                      <h3>
                        {task.TITLE} {task.IS_DELETED === true && " (DELETED)"}
                      </h3>
                      <p>Description: {task.DESCRIPTION || "N/A"}</p>
                      <p>Status: {task.STATUS}</p>
                      <p>
                        Created by: {task.createdBy?.USERNAME || "Unknown User"}
                      </p>{" "}
                      {/* Display username if loaded */}
                      <p>
                        Last Updated:{" "}
                        {new Date(task.UPDATED_AT).toLocaleString()}
                      </p>
                      {task.IS_DELETED === false && (
                        <>
                          {/* Show Edit button only if user has permission AND can edit THIS task */}
                          {hasPermission(GLOBALVARS.UPDATE_TASK) &&
                            (hasPermission(GLOBALVARS.READ_ALL_TASKS) ||
                              task.CREATED_BY === currentUserId) && (
                              <Button
                                onClick={() => handleEditClick(task)}
                                style={{
                                  padding: "8px 12px",
                                  backgroundColor: "#ffc107",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "5px",
                                  cursor: "pointer",
                                  marginRight: "5px",
                                }}
                              >
                                Edit
                              </Button>
                            )}
                          {/* Show Delete button only if user has permission AND can delete THIS task */}
                          {hasPermission(GLOBALVARS.DELETE_TASK) &&
                            (hasPermission(GLOBALVARS.READ_ALL_TASKS) ||
                              task.CREATED_BY === currentUserId) && (
                              <Button
                                onClick={() =>
                                  handleDeleteTask(
                                    task.TASK_ID,
                                    task.CREATED_BY
                                  )
                                }
                                style={{
                                  padding: "8px 12px",
                                  backgroundColor: "#dc3545",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "5px",
                                  cursor: "pointer",
                                }}
                              >
                                Delete
                              </Button>
                            )}
                        </>
                      )}
                    </div>
                  )}
                </Card>{" "}
              </li>
            ))
          )}
        </ul>
      </div>
    </AppTheme>
  );
}

export default App;
