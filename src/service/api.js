import axios from "axios";

export const authApi = axios.create({ baseURL: "/api"});
export const chatApi = axios.create({ baseURL: "/api/chat" });
console.log("Does interceptor works?")


chatApi.interceptors.request.use((config) => {
  const raw = localStorage.getItem("loggedAppUser");
  const token = raw ? JSON.parse(raw)?.token : null;

  config.headers = config.headers ?? {};
  if (token) config.headers["Authorization"] = `Bearer ${token}`;

  console.log("INTERCEPTOR:", config.method, config.baseURL, config.url);
  console.log("AUTH SET TO:", config.headers["Authorization"]);

  return config;
});