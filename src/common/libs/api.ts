import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const baseURL = import.meta.env.VITE_API_URL;
if (!baseURL) {
  throw new Error("VITE_API_URL is missing");
}

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get access token
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Return response data directly
    return response.data;
  },
  async (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          // Unauthorized
          if (typeof window !== "undefined") {
            // localStorage.removeItem("access_token");
            // window.location.href = "/login";
          }
          break;

        case 403:
          console.error("Forbidden: You don't have permission.");
          break;

        case 404:
          console.error("Resource not found.");
          break;

        case 500:
          console.error("Internal server error.");
          break;
      }
    } else if (error.request) {
      console.error("Network error: No response from server.");
    } else {
      console.error("Request error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
