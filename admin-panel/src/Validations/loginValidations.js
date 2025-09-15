import { PASSWORD_REGEX } from "../constant";
import { EMAIL_REGEX } from "../regex/regex";

// login validations
export const LoginValidations = {
  email: {
    required: "Email address is required",
    pattern: {
      value: EMAIL_REGEX,
      message: "Please enter a valid email address",
    },
  },
  password: {
    required: "Password is required",
    pattern:{
      value: PASSWORD_REGEX,
      message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }
  },
};
