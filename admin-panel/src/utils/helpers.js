import moment from "moment";
import {
  BACKDOOR_OPTIONS,
  MEASURE_OPTIONS,
  RECIPE_MEASURE_OPTIONS,
  SWEDEN_COUNTY_OPTIONS,
} from "../constant";
import { T } from "./languageTranslator";
import { makeApiRequest } from "../api/apiFunctions";
const base_url = import.meta.env.VITE_APP_BASE_URL;
const userName = localStorage?.getItem("userName");
const routeTitles = {
  "/dashboard": `Welcome ${userName}`,
  "/products": T["products"],
  "/add-new-product": T["new_product"],
  "/categories": T["categories"],
  "/raw-materials": T["raw_materials"],
  "/configuration": T["zip_code_configuration"],
  "/recipe": T["recipe"],
  "/add-edit-recipe": T["new_recipe"],
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
  "/view-product": T["view_product"],
  "/profile": T["profile"],
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

export const isValidType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

const MAX_FILE_SIZE_MB = 10;

export const isValidSize = (file,size = MAX_FILE_SIZE_MB) => {
  const maxSizeInBytes = size * 1024 * 1024;
  return file.size <= maxSizeInBytes;
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
    // slug: generateUniqueSlug(values?.name),
    meta_description: meta_description ? meta_description : " ",
    focused_keyword: extractSelectOptions(focused_keyword, "value"),
    preview_as: preview_as,
  };
  return result;
};
const generateUniqueSlug = (name) => {
  if (!name) return "";

  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const timestamp = Date.now();
  const uniqueId = Math.random().toString(36).substring(2, 8);

  return `${slug}-${uniqueId}-${timestamp}`;
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
  if (imagePreview) {
    const newPreview = imagePreview.substring(1);
    return `${base_url}${newPreview}`;
  }
};

export const listCategories = (categories) => {
  if (categories?.length) {
    const categoryNames = categories.map(({ name, ...rest }) => name);
    const result = categoryNames.join(", ");
    return truncateString(result, 25);
  } else{
    return "-"
  }
};

export const handleCategory = (categories) => {
  if (categories?.length) {
    const result = categories?.map(({ id }) => String(id));
    return result;
  }
};

export const generateRandomCode = (length = 6) => {
  // Ensure the length is between 6 and 12
  if (length < 6 || length > 12) {
    throw new Error("Length must be between 6 and 12 characters.");
  }

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
  publish: "published",
};
export const handleBulkMessage = (field) => {
  return `Please select at least one ${field} before performing any bulk action`;
};
// for calculating complete length of categories and subcategories
export const completeLength = (categories) => {
  let tempCategories = [];
  let tempSubCategories = [];

  categories?.forEach((elem) => {
    tempCategories?.push(elem?.id);
    elem?.subcategories?.map((subcat) => {
      tempSubCategories?.push(subcat?.id);
    });
  });
  return tempCategories?.length + tempSubCategories?.length;
};

export function downloadPDF(responseData, fileName = "document.pdf") {
  // Convert the API response to a Blob object
  const blob = new Blob([responseData], { type: "application/pdf" });

  // Create a temporary link element
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName;

  // Trigger the download
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
}

export function handlePrint(responseData) {
  // Convert the API response to a Blob object
  const blob = new Blob([responseData], { type: "application/pdf" });

  // Create a temporary URL for the Blob
  const pdfUrl = window.URL.createObjectURL(blob);

  // Open the URL in a new tab or window
  const printWindow = window.open(pdfUrl);

  // Wait for the PDF to load, then trigger print
  printWindow.onload = () => {
    printWindow.print();
  };
}
export const updatedIngredients = (ingredients, quantity) => {
  const result = [];
  if (ingredients?.length && quantity) {
    ingredients?.forEach((curElem) => {
      const item = {
        ...curElem,
        quantity: Number(quantity) * Number(curElem?.quantity),
      };
    });
  }
};

export const handlePrintPdf = async (url) => {
  const updatedUrl = url.substring(1);
  const absoluteUrl = `${base_url}${updatedUrl}`;

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
export const handlePrintImage = async (url) => {
  try {
    // Fetch the image content as a Blob
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch the image");
    }

    const responseData = await response.blob(); // Get the Blob data

    // Create a temporary URL for the Blob
    const imageUrl = URL.createObjectURL(responseData);

    // Open the image in a new tab
    const printWindow = window.open("");

    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Image</title>
          </head>
          <body style="display:flex; justify-content:center; align-items:center; height:100vh; margin:0;">
            <img src="${imageUrl}" onload="window.print(); window.onafterprint = () => window.close();" style="max-width:100%; max-height:100%;" />
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      alert("Please allow pop-ups for this site to print.");
    }
  } catch (error) {
    console.error("Error loading image:", error);
  }
};

export const handleViewPdf = (url) => {
  const updatedUrl = url.substring(1);
  const absoluteUrl = `${base_url}${updatedUrl}`;

  // Open the PDF directly in a new tab/window for viewing
  const viewWindow = window.open(absoluteUrl, "_blank");

  // Optionally, handle the case where the window fails to open (blocked by browser)
  if (!viewWindow) {
    alert("Please allow popups for this website to view the PDF");
  }
};

export const generateDefaultIngredientList = (ingredients) => {
  if (ingredients?.length) {
    const convertedData = ingredients.map((item) => ({
      quantity: item.quantity,
      unit: item.unit_of_measure,
      name: item.name,
    }));
    return convertedData;
  }
};
export const generateIngredientText = (item) => {
  return `${item?.quantity}${item?.unit}-${item?.name}`;
};
export const calculateItems = (items) => {
  if (items?.length) {
    return items.reduce((total, item) => total + item.quantity, 0);
  }
};

export const calculateItemSubtotal = (items) => {
  if (items?.length) {
    const subtotal = items.reduce((acc, item) => {
      const quantity = item.quantity;
      const price = parseFloat(item.price); // Convert price to a number
      const totalAmount = quantity * price;
      return acc + totalAmount;
    }, 0);
    return subtotal;
  }
};

export function truncateString(input, limit = 23) {
  if (input?.length) {
    if (input?.length > limit) {
      return input.slice(0, limit) + "...";
    }
    return input;
  } else {
    return "-";
  }
}

export const transformUserSummaryToChartData = (data) => {
  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];

  if (data?.last_month_summary?.length && data.current_month_summary) {
    const lastMonthData = data?.last_month_summary.map(
      (item) => item?.total_customers
    );
    const currentMonthData = data.current_month_summary.map(
      (item) => item?.total_customers
    );
    return {
      labels: weeks.slice(
        0,
        Math.max(lastMonthData.length, currentMonthData.length)
      ),
      datasets: [
        {
          label: "This Month",
          data: currentMonthData,
          borderColor: "#475857",
          backgroundColor: "#475857",
          fill: false,
          tension: 0.4,
        },
        {
          label: "Last Month",
          data: lastMonthData,
          borderColor: "#B7AE90",
          backgroundColor: "#B7AE90",
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }
};
export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const calculateTotal = (data, key) => {
  if (data?.length) {
    const total = data.reduce((sum, item) => sum + (item?.[key] ?? 0), 0);
    return total;
  }
};
export const stripHtmlTags = (html) => {
  if (html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  } else {
    return "";
  }
};

export const filterDeletedItems = (items) => {
  let result = [];
  if (items?.length) {
    result = items.filter((item) => item.is_deleted === false);
  }
  return result;
};
export const getPrimaryAddress = (addresses) => {
  let result = "";
  if (addresses?.length) {
    const elem = addresses.find((item) => item.primary === true);
    if (elem) {
      result = elem.address;
    } else {
      result = "";
    }
  }
  return result;
};

export const getState = (stateName) => {
  if (!stateName) return null;

  const match = SWEDEN_COUNTY_OPTIONS.find((option) =>
    stateName.toLowerCase().includes(option.label.toLowerCase())
  );

  return match ? match.value : null;
};
export const formatPostalCode = (postalCode) => {
  if (!postalCode || typeof postalCode !== "string") {
    return "";
  }
  return postalCode.replace(/\s+/g, "");
};
export const extractStateOption = (options, valueToExtract, key) => {
  if (options?.length && valueToExtract) {
    const elem = options.find(
      (curElem) => curElem[key].toLowerCase() == valueToExtract.toLowerCase()
    );
    console.log(elem, "this is elem");
    return elem || null;
  }
  return null;
};

export const createRecipePayload = (values) => {
  let result = {};
  result = {
    ...values,
    preparation_time: +values?.preparation_time,
    serving_size: +values?.serving_size,
    cook_time: +values?.cook_time,
    instructions: appendStepCountInObject(values?.instructions),
    ingredients: createIngredientPayload(values?.ingredients),
    difficulty_level: values?.difficulty_level?.value,
    dietary_plan: values?.dietary_plan?.value,
    allergen_information: values?.allergen_information?.value,
    category: values?.category
      ? Array.isArray(values?.category)
        ? values?.category.map(Number)
        : [values?.category]
      : null,
  };
  return result;
};

export const getSortValue = (value) => {
  if (value.startsWith("-") || value === "z_to_a") {
    return "desc";
  } else {
    return "asc";
  }
};

export const removeLeadingDash = (value) => {
  if (value.startsWith("-")) {
    return value.slice(1);
  }
  return value;
};

export const formatAllergenInfo = (options) => {
  let result = [];
  if (options?.length) {
    result =  options.map((el) => el.value);
  } 
  console.log(result, "this is result");
  return result;
};

// export const extractAllergenInfoOptions = (options) => {
//   if (options?.length) {
//   } else {
//     return [];
//   }
// };

export const extractAllergenInfo = (options, allergenValues) => {
  if (options?.length) {
    let result = [];
  } else {
    return [];
  }
};

export function extractAfterCom(text) {
  const match = text.match(/\.com.{2}(.*)/);
  return match ? match[1].trim() : "No match found";
}

export const getGreeting = () => {
  // Get current time in Sweden timezone
  // const swedenTime = new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' });
  // const hours = new Date(swedenTime).getHours();

  const indiaTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  const hours = new Date(indiaTime).getHours();

  // // Get current time in Sweden's timezone
  // const swedenTime = new Date().toLocaleString('en-US', { timeZone: 'Europe/Stockholm' });
  // const hours = new Date().getHours(); // Directly get hours from current time

  // Return appropriate greeting based on time of day
  if (hours >= 5 && hours < 12) {
    return "good_morning";
  } else if (hours >= 12 && hours < 17) {
    return "good_afternoon";
  } else if (hours >= 17 && hours < 22) {
    return "good_evening";
  } else {
    return "good_night";
  }
};

export const createDeleteConfirmationTitle = (text, status) => {
  if (status === "trash") {
    return `Are you sure you want to move this ${T[text]} to trash?`;
  } else if (status === "delete") {
    return `Are you sure you want to permanently delete this ${T[text]}?`;
  }
  return "";
};

export const createDeleteConfirmationDescription = (text, status) => {
  if (status === "trash") {
    return `This action cannot be undone. Moving this ${T[text]} to trash will temporarily remove it `;
  } else if (status === "delete") {
    return `This action is irreversible. Deleting this ${T[text]} will permanently remove it.`;
  }
  return "";
};

// for creating payload for patch API to convert it's status into trash

export const createPayloadForRawMaterial = (item) => {
  const payload = {
    name: item?.name,
    reorder: +item?.reorder,
    unit_of_measure: item?.unit_of_measure,
    quantity: +item.quantity,
    cost: item?.cost,
    description: item?.description,
    expiry_date: formatDate(item.expiry_date, "YYYY-MM-DD"),
    is_active: false,
    is_deleted: true,
  };

  return payload;
};

export const createPayloadForRecipe = (item) => {
  console.log(item, "this is recipe item");
  // const payload = {
  //   id: item?.id,
  //   recipe_title: item?.recipe_title,
  //   description: item?.description,
  //   preparation_time: item?.preparation_time,
  //   cook_time: item?.cook_time,
  //   serving_size: item?.serving_size,
  //   difficulty_level: item?.difficulty_level,
  //   dietary_plan: item?.dietary_plan,
  //   allergen_information: "",
  //   status: item?.status.toLowerCase(),
  //   ingredients: item?.ingredients?.length ? item?.ingredients : [],
  //   instructions: item?.instructions?.length ? item?.instructions : [],
  //   notes: item?.notes || "",
  //   is_active: false,
  //   is_deleted: true,
  // };
  // const formData = new FormData();
  // for (let key in payload) {
  //   if (
  //     key === "ingredients" ||
  //     key === "instructions" ||
  //     key === "category" ||
  //     key === "allergen_information"
  //   ) {
  //     const striginfiedResult = JSON.stringify(payload[key]);
  //     formData.append(key, striginfiedResult);
  //   } else {
  //     formData.append(key, payload[key]);
  //   }
  // }
  // formData.append("allergen_information", JSON.stringify([]));

  // Appending files here
  // files.forEach(({ file }) => {
  //   if (file) {
  //     formData.append("recipe_images", file);
  //   }
  // });
  // if (file?.file) {
  //   formData.append("recipe_images", file?.file);
  // } else if (!file?.file && !file?.preview) {
  //   formData.append("recipe_images", "");
  // }
  const payload = {
    is_active: false,
    is_deleted: true,
  }
  let formData = new FormData();
  for (let key in payload) {
    formData.append(key, payload[key]);
  }
  return formData;
};

export const createCustomerPayload = (item) => {
  console.log(item, "this is customer item");
  const payload = {
    is_active: false,
  };
  console.log(item, "this is customer payload");

  return payload;
};

export const createPayloadForProduct = (item) => {
  console.log(item,"this is product item");
  const payload = {
    // ...item,
    is_active: false,
    is_deleted: true,
  };
  const formData = new FormData();
  for (let key in payload) {
    formData.append(key, payload[key]);
  }
  return formData;
};

export const createCategoryPayload = () => {
  const payload =  {
    is_deleted:true,
    is_active:false
  }
  const formData = new FormData();
  for (let key in payload) {
    formData.append(key, payload[key]);
  }
  return formData;
}

export const removeUnreadNotification = (notifications) => {
  if(notifications?.length){
    const result = notifications.filter((item) => item?.is_read);
    return result;
  }
  return [];
}