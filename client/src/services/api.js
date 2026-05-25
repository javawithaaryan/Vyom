import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
export const checkTransaction = async (transactionData) => {
  const response = await api.post(
    "/fraud/check",
    transactionData
  );

  return response.data;
};

export const analyzeScamMessage = async (messageData) => {
  const response = await api.post(
    "/scam/analyze",
    messageData
  );

  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get(
    "/dashboard/stats"
  );

  return response.data;
};