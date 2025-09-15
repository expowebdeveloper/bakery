import Cookies from "js-cookie";
import { baseURL, INSTANCE } from "@/_Api Handlers/apiConfig";
import { LOGOUT_ENDPOINT } from "@/_Api Handlers/endpoints";
import { callApi, METHODS } from "@/_Api Handlers/apiFunctions";
import { toastMessage } from "./toastMessage";

export const returnAddressInfo = (addressComponents) => {
  if (addressComponents) {
    const countryObj = addressComponents?.find((component) =>
      component.types.includes("country")
    );

    const stateObj = addressComponents?.find((component) =>
      component.types.includes("administrative_area_level_1")
    );

    const cityObj = addressComponents?.find(
      (component) =>
        component.types.includes("locality") ||
        component.types.includes("sublocality") ||
        component.types.includes("administrative_area_level_2") ||
        component.types.includes("route")
    );
    const city = cityObj?.long_name;

    return {
      country: countryObj?.short_name || null,
      state: stateObj?.short_name || null,
      city: cityObj?.long_name || null,
    };
  }
};

export const manageUserAuthorization = ({
  action,
  token = null,
  refreshToken = null,
  firstName = null,
  lastName = null,
}) => {
  if (action === "remove") {
    callApi({
      endPoint: LOGOUT_ENDPOINT,
      method: METHODS.post,
      instanceType: INSTANCE?.authorized,
    })
      .then((res) => {
        // toastMessage("Logout Successfully", "success");
        Cookies.remove("token");
        Cookies.remove("refreshToken");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        Cookies.remove("firstName");
        Cookies.remove("lastName");
        Cookies.remove("sessionid");
      })
      .catch((error) => {
        console.error("Error adding to favorites:", error);
        toastMessage("Something went wrong", "error");
      });
  } else {
    Cookies.set("token", token);
    Cookies.set("refreshToken", refreshToken);
    Cookies.set("firstName", firstName);
    Cookies.set("lastName", lastName);
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
  }
};

export const createPreview = (imagePreview) => {
  if (imagePreview?.startsWith("/")) {
    imagePreview = imagePreview.replace(/^\/+/, ""); // Remove leading slash
  }

  console.log("inside preview imagePreview:", imagePreview, "baseURL:", baseURL);

  // Ensure baseURL does not have a trailing slash
  const finalUrl = `${baseURL.replace(/\/+$/, "")}/${imagePreview}`;

  console.log(finalUrl, "this is preview");

  return finalUrl;
};

