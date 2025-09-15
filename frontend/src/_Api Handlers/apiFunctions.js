import { authAxios, authorizeAxios } from "./apiConfig";
import { INSTANCE } from "./apiConfig";

export const METHODS = {
  get: "GET",
  post: "POST",
  put: "PUT",
  patch: "PATCH",
  delete: "DELETE",
};

export const cleanFilters = (filters) => {
  return Object.keys(filters).reduce((acc, key) => {
    if (filters[key]) {
      acc[key] = encodeURIComponent(filters[key]); // Encode the value
    }
    return acc;
  }, {});
};


export const callApi = async ({
  endPoint,
  method,
  params,
  payload,
  instanceType = INSTANCE.auth,
  headers = {},
}) => {
  try {
    let API_INSTANCE = null;
    if (instanceType === INSTANCE.auth) {
      API_INSTANCE = authAxios;
    } else if (instanceType === INSTANCE.formInstance) {
      API_INSTANCE = authorizeFileInstance;
    } else {
      API_INSTANCE = authorizeAxios;
    }

    const config = {
      headers,
    };

    switch (method) {
      case METHODS.get: {
        let cleanedParams;
        if (params) {
          cleanedParams = cleanFilters(params);
        }
        return await API_INSTANCE.get(endPoint, {
          ...config,
          params: cleanedParams || {},
        });
      }

      case METHODS.post: {
        return await API_INSTANCE.post(endPoint, payload, config);
      }

      case METHODS.put: {
        return await API_INSTANCE.put(endPoint, payload, config);
      }

      case METHODS.patch: {
        return await API_INSTANCE.patch(endPoint, payload, config);
      }

      case METHODS.delete: {
        return await API_INSTANCE.delete(endPoint, {
          ...config,
          data: payload,
        });
      }

      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  } catch (error) {
    console.error(`API call failed: ${error}`);
    throw error;
  }
};


export const login = (payload) => {
  return authAxios.post("/login/", payload);
};

export const logout = (payload) => {
  return authAxios.post("/logout/", payload);
};

export const signUp = (payload) => {
  return authAxios.post("/bakery/register/", payload);
};

export const sendEmailOtp = (payload) => {
  return authAxios.post("/password/forget/", payload);
};

export const verifyOtp = (payload) => {
  return authAxios.post("/password/otp-verify/", payload);
};

export const changePassword = (payload) => {
  return authAxios.post("/password/reset/", payload);
};

export const verifyEmail = (payload) => {
  return authAxios.post("/send-verification-email/", payload);
}

export const verifyEmailOTP = (payload) => {
  return authAxios.post("/verify-email/", payload);
}