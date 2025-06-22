// frontend/src/api/taskApi.ts
import axios from "axios";
import { Task, CreateTaskDto, UpdateTaskDto } from "../types";

// IMPORTANT: Make sure this matches your backend's URL and API prefix
const API_BASE_URL = "http://localhost:3000/api"; // Use 5000 as per .env.example
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Axios Interceptor to add JWT to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Get token from local storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Add it to Authorization header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API Service
export const loginUser = async (
  username: string,
  password: string
): Promise<{ token: string }> => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    username,
    password,
  });
  return response.data;
};

// Existing Task API methods
export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get("/tasks");
  console.log("response", response);
  return response.data;
};

export const getTaskById = async (id: number): Promise<Task> => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (taskData: CreateTaskDto): Promise<Task> => {
  const response = await api.post("/tasks", taskData);
  return response.data;
};

export const updateTask = async (
  id: number,
  taskData: UpdateTaskDto
): Promise<Task> => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id: number): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};
