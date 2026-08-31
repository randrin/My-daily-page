import axios from "axios";
import config from "@/config";

export const apiClient = axios.create({
  baseURL: config.host_server ?? "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});
