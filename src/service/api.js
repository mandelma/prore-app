import axios from "axios";

//export const authApi = axios.create({ baseURL: "/api"});
//export const api = axios.create({baseURL: "/api/users"});
console.log("Does interceptor works?")

const attachAuth = (apiInstance) => {
  apiInstance.interceptors.request.use((config) => {
    const raw = localStorage.getItem("loggedAppUser") || sessionStorage.getItem("loggedAppUser");
    const token = raw ? JSON.parse(raw)?.token : null;

    /* console.log("INTERCEPTOR:", {
      url: config.url,
      raw,
      token
    }); */

    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return apiInstance;
}

export const authApi = attachAuth(
  axios.create({
    baseURL: "/api"
  })
);

export const chatApi = attachAuth(axios.create({ baseURL: "/api/chat" }));
export const userApi = attachAuth(axios.create({ baseURL: "/api/users" }));