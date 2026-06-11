import axios from "axios";

// =========================
// CREATE AXIOS INSTANCE
// =========================

const API = axios.create({
  baseURL:
    "https://football-be-1.onrender.com/api",

  headers: {
    "Content-Type":
      "application/json",
  },
});

// =========================
// AUTO ATTACH TOKEN
// =========================

API.interceptors.request.use(
  (config) => {
    // GET TOKEN
    const token =
      localStorage.getItem(
        "token"
      );

    // ATTACH TOKEN
    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// =========================
// HANDLE TOKEN EXPIRED
// =========================

API.interceptors.response.use(
  (response) => response,

  (error) => {
    // TOKEN EXPIRED / INVALID
    if (
      error.response?.status ===
      401
    ) {
      // REMOVE TOKEN
      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "userInfo"
      );

      // OPTIONAL REDIRECT
      // window.location.href =
      //   "/login";
    }

    return Promise.reject(error);
  }
);

export default API;