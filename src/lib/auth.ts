import axios from "axios";

export const register = async (data: any) => {
  return axios.post("/api/account/register", data);
};

export const login = async (data: any) => {
  return axios.post("/api/account/login", data);
};

export const logout = async () => {
  return axios.post("/api/account/logout");
};
