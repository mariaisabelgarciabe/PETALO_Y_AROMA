import axios from "axios";

const API = axios.create({
  baseURL: "/api/v1",
  timeout: 10000,
});

export const getHealth = () => API.get("/health").then((response) => response.data);

export default API;