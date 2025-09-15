import { T } from "@/utils/languageTranslator";
import { EMAIL_REGEX, INVALID_EMAIL_MESSAGE } from "./authValidations";

export const BillingDetailsValidations = {
  name: {
    required: "Name is required",
  },
  // validations for extra added fields
  company_name: {
    required: T["company_name_is_required"],
  },
  organization_number: {
    required: T["organization_number_is_required"],
  },
  vat_id: {
    required: T["vat_id_is_required"],
  },

    // validations for extra added fields
  phone_number: {
    required: "Phone number is required",
    minLength: {
      value: 10,
      message: "Phone number must be exactly 10 digits",
    },
  },
  email: {
    required: "Email is required",
    pattern: {
      value: EMAIL_REGEX,
      message: INVALID_EMAIL_MESSAGE,
    },
  },
  city: {
    required: "City is required",
  },
  state: {
    required: "State is required",
  },
  zip_code: {
    required: "Zip code  is required",
  },
  address: {
    required: "Address is required",
  },
};
