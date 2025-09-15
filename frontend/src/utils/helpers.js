'use client';

import moment from "moment";
import {
  BACKDOOR_OPTIONS,
  MEASURE_OPTIONS,
  RECIPE_MEASURE_OPTIONS,
  SWEDEN_COUNTY_OPTIONS,
} from "../_constants/constant";
import { T } from "./languageTranslator";
const base_url = process.env.NEXT_PUBLIC_BASE_URL;
// const userName = localStorage?.getItem("userName");
let userName;
if (typeof window !== "undefined") {
  userName = localStorage?.getItem("userName");
}

const routeTitles = {
  "/dashboard": `Welcome ${userName}`,
  "/products": T["products"],
  "/add-new-product": T["new_product"],
  "/categories": T["categories"],
  "/raw-materials": T["raw_materials"],
  "/configuration": T["zip_code_configuration"],
  "/recipe": T["recipe"],
  "/add-edit-recipe": T["new_recip"],
  "/inventory": T["inventory_management"],
  "/employee": T["employee_management"],
  "/payment-history": T["payment_history"],
  "/to-do": T["to_do_list"],
  "/add-edit-product": T["new_product"],
  "/discounts": T["discounts_promotions_management"],
  "/customers": T["customers_management"],
  "/support": T["customers_support_management"],
  "/notifications": T["notifications_and_alerts"],
  "/settings": T["settings"],
  "/orders-management": T["order_management"],
  "/orders-history": T["order_history"],
  "/view-product": T["view_product"]
};

export const getHeadingTitleFromRoute = (pathName) => {
  if (localStorage?.getItem("isRecipeEdit")) {
    return "Edit Recipe";
  }
  return routeTitles?.[pathName] || "";
};

// for removing empty filters and encoding them
export const cleanFilters = (filters) => {
  return Object.keys(filters).reduce((acc, key) => {
    if (filters[key]) {
      // acc[key] = encodeURIComponent(filters[key]); // Encode the value
      acc[key] = filters[key];
    }
    return acc;
  }, {});
};

// to render S.No for tables
export const renderSerialNumber = (currentPage, itemsPerPage, index) => {
  return (currentPage - 1) * itemsPerPage + index + 1;
};

// will be used to delete a particular item from an array of object  based on id

export const deleteItemBasedOnId = (arr, id) => {
  if (arr?.length) {
    return arr.filter((el) => el.id !== id);
  }
};
// to check whether the uploaded image is of valid type of not

export const isValidType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

export const prefillFormValues = (data, prefillkeys, setValue) => {
  prefillkeys?.forEach((key) => {
    if (data?.[key]) {
      setValue(key, data[key]);
    }
  });
};

export const employeeListIntoOptions = (employeeList) => {
  let result = [];
  if (employeeList?.length) {
    employeeList?.forEach(({ first_name, last_name, id, email }) => {
      const option = {
        label: `${first_name} ${last_name} (${email})`,
        value: id,
      };
      result.push(option);
    });
  }
  return result;
};

export const extractOption = (options, valueToExtract, key) => {
  if (options?.length && valueToExtract) {
    const elem = options?.find((curElem) => curElem?.[key] == valueToExtract);
    return elem;
  }
};

export const formatDate = (date, format) => {
  if (date && format) {
    return moment(date).format(format);
  }
};
export const returnAddressInfo = (addressComponents) => {
  if (!addressComponents) {
    return { country: null, state: null, city: null, zip: null };
  }

  const countryObj = addressComponents.find((component) =>
    component.types.includes("country")
  );

  const stateObj = addressComponents.find((component) =>
    component.types.includes("administrative_area_level_1")
  );

  // Include postal_town as a fallback for city if locality or sublocality is not present
  const cityObj = addressComponents.find(
    (component) =>
      component.types.includes("locality") ||
      component.types.includes("sublocality") ||
      component.types.includes("administrative_area_level_2") ||
      component.types.includes("postal_town") || // Fallback for city
      component.types.includes("route") // Even fallback to street name
  );

  const zipObj = addressComponents.find((component) =>
    component.types.includes("postal_code")
  );
  console.log(zipObj, "this is zip obj");

  return {
    country: countryObj?.short_name || null,
    state: stateObj?.short_name || "Unknown State", // Fallback to a placeholder value
    city: cityObj?.long_name || "Unknown City", // Fallback to a placeholder value
    zip: zipObj?.long_name || null, // Return null if postal code is not found
  };
};

export const handleEdit = (arr, id, dataToUpdate) => {
  if (arr.length) {
    const temp = [...arr];
    const index = temp.findIndex((el) => el.id == id);
    if (index !== -1) {
      const item = { ...temp[index], ...dataToUpdate };
      temp[index] = item;
    }
    return temp;
  }

  // return arr.map((el) =>
  //   el.id === id ? { ...el, ...dataToUpdate } : el
  // );
};

export const appendStepCountInObject = (instructions) => {
  if (instructions?.length) {
    const result = [];
    instructions.forEach((curElem, index) => {
      const item = { ...curElem, step_count: index + 1 };
      result.push(item);
    });
    return result;
  }
};

export const createRequiredValidation = (fieldName, customMessage) => {
  if (customMessage) {
    // if custom message is true then inside fieldname custom message will be passed
    return { required: customMessage };
  } else {
    const field = fieldName || "This field";
    return { required: `${field} is required` };
  }
};

export const createProductSeo = (values) => {
  const { focused_keyword, seo_title, slug, preview_as, meta_description } =
    values;
  const result = {
    seo_title: seo_title,
    slug: slug,
    meta_description: meta_description,
    focused_keyword: extractSelectOptions(focused_keyword, "value"),
    preview_as: preview_as,
  };
  return result;
};

export const createInventoryPayload = (values) => {
  const {
    sku,
    regular_price,
    sale_price,
    weight,
    unit,
    bulking_price_rules,
    sale_price_dates_from,
    sale_price_dates_to,
  } = values;
  const result = {
    sku: sku,
    regular_price: regular_price,
    sale_price: sale_price,
    weight: weight,
    unit: unit?.value,
    bulking_price_rules: bulking_price_rules,
    sale_price_dates_from: sale_price_dates_from,
    sale_price_dates_to: sale_price_dates_to,
  };
  return result;
};

export const extractSelectOptions = (options, valueToExtract) => {
  if (options.length) {
    const result = [];
    options.forEach((curElem) => {
      if (curElem?.[valueToExtract]) {
        result.push(curElem[valueToExtract]);
      }
    });
    return result;
  }
};

export const createAdvancedPayload = (values) => {
  return {
    minimum_order_quantity: values?.minimum_order_quantity,
    purchase_note: values?.purchase_note,
  };
};

export const createVariantPayload = (values) => {
  if (values?.variants?.length) {
    const temp = [...values.variants];
    const result = [];
    temp.forEach((curElem) => {
      const item = {
        ...curElem,
        allow_backorders: curElem?.allow_backorders.value,
        unit: curElem?.unit?.value,
        quantity: +curElem?.quantity,
      };
      result.push(item);
    });
    return result;
  }
};
export const createFilesObject = (files) => {
  const result = {};
  files.forEach(({ file }) => {
    if (file) {
      result["category_images"] = file;
    }
  });
};

export const isFilesNotEmpty = (files) => {
  return files.some(({ file }) => file);
};

export const handleRawMaterialErrorToast = (err) => {
  if (err?.response?.data?.name?.[0]) {
    return err?.response?.data?.name?.[0];
  } else if (err?.response?.data?.slug?.[0]) {
    return err?.response?.data?.slug?.[0];
  } else {
    return DEFAULT_ERROR_MESSAGE;
  }
};

export const convertIntoSelectOptions = (options, labelKey, valueKey) => {
  const result = [];
  options.forEach((curElem) => {
    const option = {
      label: curElem?.[labelKey],
      value: curElem?.[valueKey],
    };
    result.push(option);
  });
  return result;
};

export const createPreview = (imagePreview) => {
  if (imagePreview?.startsWith('/')) {
    imagePreview = imagePreview.replace(/^\/+/, ""); // Remove leading slash
  }

  console.log("inside preview imagePreview: ", imagePreview, "baseUrl: ", base_url);
  
  const finalUrl = `${base_url.replace(/\/+$/, "")}/${imagePreview}`; // Ensure no double slashes
  
  console.log(finalUrl, "this is preview 2");
  return finalUrl;
};

export const listCategories = (categories) => {
  if (categories?.length) {
    const categoryNames = categories.map(({ name, ...rest }) => name);
    return categoryNames.join(", ");
  }
};

export const handleCategory = (categories) => {
  if (categories?.length) {
    const result = categories?.map(({ id }) => String(id));
    return result;
  }
};

export const generateRandomCode = (length = 5) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  return code;
};
// extract from is for label or value
export const convertSelectOptionToValue = (option, extractFrom = "value") => {
  return option[extractFrom];
};
export const combineBarcode = (from, to) => {
  return `${from}-${to}`;
};

export const convertValuesIntoLabelAndValue = (data) => {
  if (data?.length) {
    const result = [];
    data.forEach((curElem) => {
      const item = { label: curElem, value: curElem };
      result.push(item);
    });
    return result;
  }
};

export const createName = (firstName, lastName) => {
  return `${firstName} ${lastName}`;
};
export const createSlugValidation = () => {
  return {
    required: "Slug is required",
    // pattern: {
    //     value: /^[a-zA-Z0-9_-]+$/,
    //     message: "Only numbers, alphabets, underscores, and hyphens are allowed",
    // },
  };
};
export const createIngredientPayload = (ingredients) => {
  if (ingredients?.length) {
    const result = [];
    ingredients.forEach((ingredient) => {
      const item = {
        ...ingredient,
        unit_of_measure: ingredient?.unit_of_measure?.value,
      };
      result.push(item);
    });
    return result;
  }
};

export const handleIngredients = (ingredients) => {
  if (ingredients?.length) {
    const result = [];
    ingredients.forEach((ingredient) => {
      const extractedOption = extractOption(
        RECIPE_MEASURE_OPTIONS,
        ingredient?.unit_of_measure,
        "value"
      );
      const item = { ...ingredient, unit_of_measure: extractedOption };
      result.push(item);
    });
    return result;
  }
};
export const getHeadingTitleFromState = (state) => {
  if (state === "amount_off_product") {
    return "Amount Off Products";
  } else if (state === "buy_x_get_y") {
    return "Buy X Get Y";
  } else if (state === "amount_off_order") {
    return "Amount Off Order";
  } else {
    return "Free Shipping";
  }
};

export const createVariantsData = (variants) => {
  const result = [];
  if (variants?.length) {
    variants.forEach((curElem) => {
      const item = {};
      const directKeys = [
        "allow_backorders",
        "description",
        "enabled",
        "managed_stock",
        "name",
        "sku",
      ];
      const inventoryKeys = [
        "regular_price",
        "sale_price",
        "sale_price_dates_from",
        "sale_price_dates_to",
        "sku",
        "weight",
        "bulking_price_rules",
        "total_quantity",
        "unit",
      ];
      directKeys.map((key) => {
        if (key === "description") {
          item[key] = extractTextFromParagraph(curElem[key]);
        } else if (key === "allow_backorders") {
          const extractedOption = extractOption(
            BACKDOOR_OPTIONS,
            "allow",
            "value"
          );
          item[key] = extractedOption;
        } else {
          item[key] = curElem[key];
        }
      });
      inventoryKeys.map((key) => {
        if (key === "total_quantity") {
          item["quantity"] = curElem?.inventory?.[key];
        } else if (key === "unit") {
          const extractedOption = extractOption(
            MEASURE_OPTIONS,
            curElem?.inventory?.[key],
            "value"
          );
          item[key] = extractedOption;
        } else {
          item[key] = curElem?.inventory?.[key];
        }
      });
      result.push(item);
    });
  }
  return result;
};

export function extractTextFromParagraph(htmlString) {
  const match = htmlString.match(/<p>(.*?)<\/p>/);
  return match ? match[1] : "";
}

export const convertArrayToString = (array) => {
  if (array?.length) {
    return array.join(", ");
  }
};

export const formatTime = (inputTime) => {
  return moment(inputTime, "HH:mm").format("h:mm a");
};

export const COMBINATION_TO_VALUE = {
  order_discounts: "Order discounts",
  product_discounts: "Product discounts",
  shipping_discounts: "Shipping discounts",
};
export const showCombination = (combination) => {
  const formattedCombinations = combination.map((item) => {
    return COMBINATION_TO_VALUE[item];
  });
  return convertArrayToString(formattedCombinations);
};

//  for payload
export const convertProductsIntoPairs = (products) => {
  const result = [];
  products?.forEach((el) => {
    const item = { name: el?.label, id: el?.value };
    result?.push(item);
  });
  return result;
};
// for useEffect
export const convertPairFromProducts = (products) => {
  const result = [];
  products?.forEach((el) => {
    const item = { label: el?.name, value: el?.id };
    result?.push(item);
  });
  return result;
};

export const actionToText = {
  draft: "drafted",
  duplicate: "duplicated",
  delete: "deleted",
};
export const handleBulkMessage = (field) => {
  return `Please select at least one ${field} before performing any action`;
};

export const handlePrintPdf = async (url) => {
  // const updatedUrl = url.substring(1);
  if (!url?.startsWith('/')) {
    url = '/' + url;
  }
  const absoluteUrl = `${base_url}${url}`;

  try {
    // Fetch the PDF content as a Blob
    const response = await fetch(absoluteUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch the PDF");
    }

    const responseData = await response.blob(); // Get the Blob data

    // Create a temporary URL for the Blob
    const pdfUrl = window.URL.createObjectURL(responseData);

    // Open the URL in a new tab or window
    const printWindow = window.open(pdfUrl);

    // Wait for the PDF to load, then trigger print
    printWindow.onload = () => {
      printWindow.print();
    };
  } catch (error) {
    console.error("Error loading PDF:", error);
  }
};

export const handleViewPdf = (url) => {
  // const updatedUrl = url.substring(1);
  if (!url?.startsWith('/')) {
    url = '/' + url;
  }
  const absoluteUrl = `${base_url}${url}`;

  // Open the PDF directly in a new tab/window for viewing
  const viewWindow = window.open(absoluteUrl, "_blank");

  // Optionally, handle the case where the window fails to open (blocked by browser)
  if (!viewWindow) {
    alert("Please allow popups for this website to view the PDF");
  }
};

export const getState = (stateName) => {
  if (!stateName) return null;

  // Normalize input and check for a match in SWEDEN_COUNTY_OPTIONS
  const match = SWEDEN_COUNTY_OPTIONS.find((option) =>
    stateName.toLowerCase().includes(option.label.toLowerCase())
  );

  return match ? match.value : null; // Return the value or null if no match is found
};

