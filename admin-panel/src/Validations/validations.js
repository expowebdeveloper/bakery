// validations for category section

import { EMAIL_REGEX, SPECIAL_CHARACTERS_REGEX } from "../regex/regex";
import { createSlugValidation } from "../utils/helpers";
import { T } from "../utils/languageTranslator";

export const CategoryValidations = {
  name: {
    required: "Title is required",
    pattern: {
      value: SPECIAL_CHARACTERS_REGEX,
      message: "Special characters are not allowed",
    },
  },
  slug: {
    required: "Slug is required",
  },
  description: {
    // required: "Description is required",
  },
  // need to be changed according to the api
  parent_category: {
    // required: "Parent category is required",
  },
};

// validations for raw material section

export const RawMaterialValidations = {
  name: {
    required: "Material name is required",
    pattern: {
      value: SPECIAL_CHARACTERS_REGEX,
      message: "Special characters are not allowed",
    },
  },
  quantity: {
    required: "Quantity is required",
    // max: {
    //   value: 100000,
    //   message: "Quantity value must be less than or equal to 100,000",
    // },
    maxLength: {
      value: 8,
      message: "Quantity value must not be more than 8 digits in total",
    },
    min: {
      value: 1,
      message: "Quantity must be greater than zero",
    },
  },
  cost: {
    required: "Cost per unit is required",
    maxLength: {
      value: 8,
      message: "Cost per unit not be more than 8 digits in total",
    },
  },
  unit_of_measure: {
    required: "Unit of measure is required",
  },
  expiry_date: {
    required: "Expiry date is required",
  },
  reorder: {
    maxLength: {
      value: 8,
      message: "Reorder value not be more than 8 digits in total",
    },
  },
};

// validations for todo

export const TodoValidations = {
  task_id: {
    required: "Task ID is required",
  },
  title: {
    required: "Task name is required",
    pattern: {
      value: SPECIAL_CHARACTERS_REGEX,
      message: "Special characters are not allowed",
    },
  },
  description: {
    required: "Description is required",
  },
  start_date: {
    required: "Start Date is required",
  },
  assigned_to: {
    required: "This field is required",
  },
};

export const ConfigurationValidations = {
  zip_code: {
    required: "ZIP code is required",
    pattern: {
      value: /^[0-9]{5}$/,
      message: "Zip code must be exactly 5 digits",
    },
  },
  delivery_availability: {
    required: "Delivery availablity is required",
  },
  min_order_amount: {
    required: "Minimum order amount is required",
  },
  address: {
    required: " Area/Location name is required",
  },
  delivery_threshold: {
    required: "Delivery threshold is required",
    min: {
      value: 1,
      message: "Delivery threshold must be greater than 1",
    },
    max: {
      value: 999999,
      message: "Delivery threshold must be less than 999999",
    },
  },
  min_order_quantity: {
    required: "Minimum order quantity is required",
    min: {
      value: 1,
      message: "Minimum order  must be greater than 0",
    },
    max: {
      value: 9999,
      message: "Minimum order quantity must be less than 500",
    },
  },
  state: {
    required: "State is required",
  },

  city: {
    required: "City is required",
  },
};

// Recipe validations
export const RecipeValidations = {
  recipe_title: {
    required: "Recipe title is required",
  },
  preparation_time: {
    required: T["preparation_time_required"],
    max: {
      value: 300,
      message:
        T["preparation_time_max_message"],
    },
  },
  cook_time: {
    required: T["cook_time_required"],
    max: {
      value: 600,
      message: T["cook_time_max_message"],
    },
  },
  difficulty_level: {
    required: "Difficulty level is required",
  },
  serving_size: {
    required: "Serving size is required",
    min: {
      value: 1,
      message: "The serving size must be at least 1 or more",
    },
  },
  description: {
    required: "This field is required",
  },
  dietary_plan: {
    required: "This field is required",
  },
  allergen_informations: {
    required: "This field is required",
  },
};

export const EmployeeValidations = {
  employee_id: {
    required: "Employee ID is required",
    pattern: {
      value: SPECIAL_CHARACTERS_REGEX,
      message: "Special characters are not allowed",
    },
  },
  job_type: {
    required: "Job type is required",
  },
  first_name: {
    required: "First name is required",
    maxLength: {
      value: 20,
      message: "First name must not exceed 20 characters.",
    },
    minLength: {
      value: 2,
      message: "First name must be at least 2 characters long.",
    },
  },
  last_name: {
    required: "Last name is required",
    maxLength: {
      value: 20,
      message: "Last name must not exceed 20 characters.",
    },
    minLength: {
      value: 2,
      message: "Last name must be at least 2 characters long.",
    },
  },
  role: {
    required: "Role is required",
  },
  email: {
    pattern: {
      value: EMAIL_REGEX,
      message: "Please enter a valid email",
    },
    required: "Email is required",
  },
  contact_no: {
    required: "Phone number is required",
    pattern: {
      value: /^(?:46|0)[\d\s-]{7,13}$/,
      message: "Please enter a valid Swedish phone number",
    },
    minLength: {
      value: 8,
      message: "Phone number must be at least 8 digits long.",
    },
    maxLength: {
      value: 10,
      message: "Phone number must not exceed 10 digits.",
    },
  },
  shift: {
    required: "Shift is required",
  },
  hiring_date: {
    required: "Hiring date is required",
  },
  joining_date: {
    required: "Joining date is required",
  },
  address: {
    required: "Address is required",
  },
  city: {
    required: "City is required",
  },
  state: {
    required: "State is required",
  },
  zip_code: {
    required: "ZIP code is required",
    pattern: {
      value: /^[0-9]{5}$/,
      message: "Zip code must be exactly 5 digits",
    },
  },
};

// common validations
export const ZIP_CODE_VALIDATION = {
  required: "ZIP code is required",
  pattern: {
    value: /^[0-9]{5}$/,
    message: "Zip code must be exactly 5 digits",
  },
};
