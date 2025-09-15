import { cleanFilters } from "../utils/helpers";
import { authAxios, authorizeAxios, authorizeFileInstance } from "./apiConfig";
import { PRODUCT_ENDPOINT } from "./endpoints";

export const login = (payload) => {
  return authAxios.post("/login/", payload);
};

//  products flow
export const getProducts = (filters) => {
  // for removing filter keys from an object whose values are empty and further implementing encodingURIComponent
  const cleanedFilters = cleanFilters(filters);
  return authorizeAxios.get(PRODUCT_ENDPOINT, { params: cleanedFilters });
};

export const deleteProduct = (id) => {
  console.log("delete product id", id);
  return authorizeAxios.delete(`/products/${id}/`);
};

export const addProduct = (payload) => {
  console.log("add product payload", payload);
  return authorizeAxios.post(`/products/`, payload);
};

export const METHODS = {
  get: "GET",
  post: "POST",
  put: "PUT",
  patch: "PATCH",
  delete: "DELETE",
};

export const INSTANCE = {
  authorized: "authorized",
  auth: "auth",
  formInstance: "formInstance",
};

export const makeApiRequest = async ({
  endPoint,
  method,
  params,
  payload,
  instanceType = INSTANCE.authorized,
  delete_id,
  update_id,
  isCustom = false,
  isProfileUpdate = false,
  isNotification = false,
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

    switch (method) {
      case METHODS.get: {
        let config;
        let cleanedParams;
        // for removing empty key value pairs and for encoding
        if (params) {
          cleanedParams = isNotification ? params : cleanFilters(params);
          if (isCustom) {
            config = params ? { params: { ...params } } : {};
          } else {
            config = params ? { params: { ...cleanedParams } } : {};
          }
        }

        return await API_INSTANCE.get(endPoint, config);
      }

      case METHODS.post: {
        return await API_INSTANCE.post(endPoint, payload);
      }

      case METHODS.put: {
        if (update_id) {
          return await API_INSTANCE.put(endPoint + update_id + "/", payload);
        } else {
          return await API_INSTANCE.put(endPoint + "/", payload);
        }
      }

      case METHODS.patch: {
        if(isProfileUpdate){
          return await API_INSTANCE.patch(endPoint, payload);

        } else {
          return await API_INSTANCE.patch(endPoint + update_id + "/", payload);
        }
      }

      case METHODS.delete: {
        return await API_INSTANCE.delete(`${endPoint}${delete_id}/`);
      }

      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  } catch (error) {
    console.error(`API call failed: ${error}`);
    throw error;
  }
};

// forget password flow
export const sendEmailOtp = (payload) => {
  console.log("forget password payload: ", payload);
  return authAxios.post("/password/forget/", payload);
};

export const verifyOtp = (payload) => {
  console.log("Veriy Otp payload: ", payload);
  return authAxios.post("/password/otp-verify/", payload);
};

export const changePassword = (payload) => {
  console.log("change password payload: ", payload);
  return authAxios.post("/password/reset/", payload);
};

export const updateProfile = (payload) => {
  return formInstance.patch("/password/otp-verify/", payload);
};


// bulk API actions
export const bulkActionProduct = (payload) => {
  const { status } = payload;
  if (status === "delete") {
    return authorizeAxios.delete("/bulk-product-update/", { data: payload });
  } else if (status === "draft" || status === "publish") {
    return authorizeAxios.patch("/bulk-product-update/", payload);
  } else if (status === "duplicate") {
    // delete payload?.status;
    return authorizeAxios.post("/bulk-product-update/", payload);
  }
};

export const bulkActionDiscount = (payload) => {
  const { status, coupons } = payload;
  if (status === "delete") {
    // delete payload?.status;
    return authorizeAxios.delete("/bulk-coupon-update/", { data: payload });
  } else if (status === "draft" || status === "publish") {
    return authorizeAxios.patch("/bulk-coupon-update/", payload);
  } else if (status === "duplicate") {
    const newPayload = {
      coupons: [...coupons],
      status: status,
    };
    return authorizeAxios.post("/bulk-coupon-update/", newPayload);
  }
};

export const bulkActionCategory = (payload) => {
  const { status } = payload;
  if (status === "delete") {
    return authorizeAxios.delete("/bulk-category-update/", { data: payload });
  } else if (status === "draft") {
    return authorizeAxios.patch("/bulk-category-update/", payload);
  } else if (status === "duplicate") {
    delete payload?.status;
    return authorizeAxios.post("/duplicate-category/", payload);
  }
};

export const bulkActionMaterial = (payload) => {
  const { status, product_material_ids } = payload;
  if (status === "duplicate") {
    // delete payload?.status;
    const duplicatePayload = {
      product_materials: [...product_material_ids],
      status: status,
    };
    return authorizeAxios.post("/bulk-material-update/", duplicatePayload);
  } else if (status === "draft" || status === "publish" ) {
    const draftPayload = {
      product_materials: [...product_material_ids],
      status: status,
    };
    return authorizeAxios.patch("/bulk-material-update/", draftPayload);
  } else if (status === "delete") {
    const deletePayload = {
      product_materials: [...product_material_ids],
      status: status,
    };
    return authorizeAxios.delete("/bulk-material-update/", {
      data: deletePayload,
    });
  }
};

export const bulkActionRecipe = (payload) => {
  const { status, recipes } = payload;
  if (status === "duplicate") {
    // delete payload?.status;
    return authorizeAxios.post("/recipe/bulk-recipe-update/", payload);
  } else if (status === "delete") {
    return authorizeAxios.delete("/recipe/bulk-recipe-update/", {
      data: payload,
    });
  } else if (status === "draft" || status === "publish") {
    return authorizeAxios.patch("/recipe/bulk-recipe-update/", payload);
  }
};

export const bulkActionCategories = (payload) => {
  const { status, recipes } = payload;
  if (status === "duplicate") {
    return authorizeAxios.post("/bulk-category-update/", payload);
  } else if (status === "delete") {
    return authorizeAxios.delete("/bulk-category-update/", {
      data: payload,
    });
  } else if (status === "draft" || status === "publish") {
    return authorizeAxios.patch("/bulk-category-update/", payload);
  }
};

export const generateSku = (product_name) => {
  const payload = {
    product_name,
  };
  return authorizeAxios.post("/generate-sku/", payload);
};
