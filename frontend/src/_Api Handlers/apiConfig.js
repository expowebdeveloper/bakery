import axios from "axios";
import Cookies from "js-cookie";
// import { REFRESH_TOKEN } from "./APIUrls";
// update required : add this base url in env
export const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
// export const baseURL = "http://192.168.1.86:8000/";

// const refreshToken = localStorage.getItem("refresh_token");
// export const APPLICATION_BASE_URL = process.env.VITE_APP_BASE_WEBSITE_URL;

export const authAxios = axios.create({
  baseURL: baseURL,
  headers: {
    "content-type": "application/json",
  },
  withCredentials: true,
});

export const INSTANCE = {
  authorized: "authorized",
  auth: "auth",
  formInstance: "formInstance",
};

const MULTIPART = "multipart";

const createAuthorizedInstance = (type) => {
  const APIAxios = axios.create({
    baseURL: baseURL,
    withCredentials: true,   
  });

  APIAxios.interceptors.request.use((config) => {
    // const token = Cookies.get("token")
    //   ? `Bearer ${Cookies.get("token")("token")}`
    //   : "Token";
    const token = Cookies.get("token") ? `Bearer ${Cookies.get("token")}` : "Token";
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
        // authAxios
        //   .post(REFRESH_TOKEN, refreshToken)
        //   .then((res) => {
        //     localStorage.setItem("token", res.data.data.access);
        //     localStorage.setItem("refresh_token", res.data.data.refresh);
        //     const { config: oldRequest } = error;
        //     // retrigger old request
        //     authAxios
        //       .request({ ...oldRequest })
        //       .then((res) => {
        //         return res;
        //       })
        //       .catch((err) => {
        //         return err;
        //       });
        //   })
        //   .catch((err) => {
        //     console.log(err);
        //     localStorage.clear();
        //     window.location.href = "/";
        //   });
        // return Promise.reject(error);
      }
      return Promise.reject(error);
    }
  );

  return APIAxios;
};

export const authorizeAxios = createAuthorizedInstance();
export const authorizeFileInstance = createAuthorizedInstance(MULTIPART);
