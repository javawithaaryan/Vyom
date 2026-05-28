import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("vyom_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth/session errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem("vyom_token");

      // avoid infinite redirect loop
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(
      error?.response?.data || {
        message: "Something went wrong",
      }
    );
  }
);

/* =========================
   AUTH
========================= */

export const authApi = {
  register: async (data) => {
    return await api.post("/auth/register", data);
  },

  login: async (data) => {
    return await api.post("/auth/login", data);
  },

  me: async () => {
    return await api.get("/auth/me");
  },
};

/* =========================
   FRAUD
========================= */

export const fraudApi = {
  analyze: async (data) => {
    return await api.post("/fraud/analyze", data);
  },

  history: async (limit = 20) => {
    return await api.get(`/fraud/history?limit=${limit}`);
  },
};

/* =========================
   SCAM
========================= */

export const scamApi = {
  analyze: async (data) => {
    return await api.post("/scam/analyze", data);
  },

  history: async (limit = 20) => {
    return await api.get(`/scam/history?limit=${limit}`);
  },
};

/* =========================
   DASHBOARD
========================= */

export const dashboardApi = {
  stats: async () => {
    return await api.get("/dashboard/stats");
  },

  riskEvents: async (limit = 20) => {
    return await api.get(`/dashboard/risk-events?limit=${limit}`);
  },

  alerts: async (limit = 10) => {
    return await api.get(`/dashboard/alerts?limit=${limit}`);
  },
};

export default api;