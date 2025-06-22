import React, { useState, useEffect } from "react";
import { Task, CreateTaskDto, UpdateTaskDto } from "./types";
import { getTasks, createTask, updateTask, deleteTask } from "./api/taskApi";
import Login from "./components/Login";
import { jwtDecode } from "jwt-decode"; // for decoding JWT (install: npm install jwt-decode)

// IMPORTANT: Install jwt-decode library for decoding the token on the frontend
// npm install jwt-decode

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newTaskDescription, setNewTaskDescription] = useState<string>("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null); // Still useful to know who is logged in

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken: { ACCESS_ID: number; USERNAME: string } =
          jwtDecode(token);
        setIsAuthenticated(true);
        setCurrentUserId(decodedToken.ACCESS_ID);
        fetchTasks(); // Fetch tasks if authenticated
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
        const decodedToken: { ACCESS_ID: number; USERNAME: string } =
          jwtDecode(token);
        setIsAuthenticated(true);
        setCurrentUserId(decodedToken.ACCESS_ID);
        fetchTasks(); // Fetch tasks after login
      } catch (error) {
        console.error("Login success, but token decode failed:", error);
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setCurrentUserId(null);
    setTasks([]);
    setEditingTask(null);
    //alert("Logged out successfully.");
  };

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
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
    } catch (error: any) {
      console.error("Error creating task:", error);
      alert(error.response?.data?.message || "Failed to create task.");
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask({ ...task }); // Create a copy to edit
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.TITLE.trim()) {
      alert("Task title cannot be empty!");
      return;
    }

    try {
      const updateData: UpdateTaskDto = {
        TITLE: editingTask.TITLE,
        DESCRIPTION: editingTask?.DESCRIPTION,
        STATUS: editingTask.STATUS,
      };
      await updateTask(editingTask.TASK_ID, updateData);
      setEditingTask(null); // Exit editing mode
      fetchTasks(); // Refresh the list
      //alert("Task updated successfully!");
    } catch (error: any) {
      console.error("Error updating task:", error);
      alert(error.response?.data?.message || "Failed to update task.");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId);
        fetchTasks();
        //alert("Task deleted successfully!");
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
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>Task Management App</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 15px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* Task Creation Form - always visible if authenticated */}
      <h2>Create New Task</h2>
      <form
        onSubmit={handleCreateTask}
        style={{
          marginBottom: "20px",
          border: "1px solid #ccc",
          padding: "15px",
          borderRadius: "8px",
        }}
      >
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
        <button
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
        </button>
      </form>

      {/* Task List */}
      <h2>My Tasks</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.length === 0 ? (
          <p>No tasks found. Create one above!</p>
        ) : (
          tasks.map((task) => (
            <li
              key={task.TASK_ID}
              style={{
                border: "1px solid #eee",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "8px",
                backgroundColor: task.IS_DELETED === true ? "#fdd" : "#fff", // Highlight soft-deleted tasks (boolean)
              }}
            >
              {editingTask && editingTask.TASK_ID === task.TASK_ID ? (
                // Editing form for task
                <form onSubmit={handleUpdateTask}>
                  <input
                    type="text"
                    value={editingTask.TITLE}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, TITLE: e.target.value })
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
                  <button
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
                  </button>
                  <button
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
                  </button>
                </form>
              ) : (
                // Display task details
                <div>
                  <h3>{task.TITLE}</h3>
                  <p>Description: {task.DESCRIPTION || "N/A"}</p>
                  <p>Status: {task.STATUS}</p>
                  <p>
                    Created by: {task.createdBy?.USERNAME || "Unknown User"}
                  </p>{" "}
                  {/* Display username if loaded */}
                  <p>
                    Last Updated: {new Date(task.UPDATED_AT).toLocaleString()}
                  </p>
                  {task.IS_DELETED === false && (
                    <>
                      {/* Edit and Delete buttons are always visible if task is not deleted, backend will handle authorization */}
                      <button
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
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.TASK_ID)}
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
                      </button>
                    </>
                  )}
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default App;
