import axios from "axios";
import { REFRESH_TOKEN } from "./endpoints";
export const baseURL = import.meta.env.VITE_APP_BASE_URL;
const refreshToken = localStorage.getItem("refreshToken");
// export const APPLICATION_BASE_URL = process.env.VITE_APP_BASE_WEBSITE_URL;
const MULTIPART = "multipart";

export const authAxios = axios.create({
  baseURL: baseURL,
  headers: {
    "content-type": "application/json",
  },
});

const createAuthorizedInstance = (type) => {
  const APIAxios = axios.create({
    baseURL: baseURL,
  });

  APIAxios.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
      ? `Bearer ${localStorage.getItem("token")}` 
      : "Token";
    config.headers["content-type"] =
      type === MULTIPART ? "multipart/form-data" : "application/json";
    config.headers["Authorization"] = token;

    return config;
  });

  APIAxios.interceptors.response.use(
    (response) => {
      return response;
    },
    function (error) {
      if (error?.response?.status === 401) {
        localStorage.clear();
        // window.location.href = "/";
        authAxios
          .post(REFRESH_TOKEN, { refresh: refreshToken })
          .then((res) => {
            localStorage.setItem("token", res.data.access);
            localStorage.setItem("refreshToken", res.data.refresh);
            const { config: oldRequest } = error;
            // retrigger old request
            authAxios
              .request({ ...oldRequest })
              .then((res) => {
                return res;
              })
              .catch((err) => {
                return err;
              });
          })
          .catch((err) => {
            console.log(err);
            localStorage.clear();
            window.location.href = "/";
          });
        return Promise.reject(error);
      }
      return Promise.reject(error);
    }
  );
  return APIAxios;
};

export const authorizeAxios = createAuthorizedInstance();
export const authorizeFileInstance = createAuthorizedInstance(MULTIPART);
export const googleClientID = import.meta.env.VITE_GOOGLE_AUTH_LOGIN;
