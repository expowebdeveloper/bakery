// regex
export const PASSWORD_REGEX =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^A-Za-z0-9]).{6,}$/g;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const INVALID_EMAIL_MESSAGE = "Please enter a valid email";

// login validations
export const LoginValidations = {
  email: {
    required: "Email is required",
  },
  password: {
    required: "Password is required",
  },
};

export const IndivisualSignupValidations = {
  company_name: {
    required: "Company name is required",
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
  phone_number: {
    required: "Phone number is required",
    pattern: {
      value: /^(?:46|0)[\d\s\-]{7,13}$/,
      message: "Please enter a valid Swedish phone number",
    },
  },
  email: {
    required: "Email is required",
    pattern: {
      value: EMAIL_REGEX,
      message: INVALID_EMAIL_MESSAGE,
    },
  },
  password: {
    required: "Password is required",
    pattern: {
      value: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^A-Za-z0-9]).{6,}$/g,
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
    },
  },
  address: {
    required: "Delivery address is required",
  },
  zipcode: {
    required: "ZIP code is required",
  },
  terms_conditions: {
    required: "This field is required",
  },
  contact_method: {
    // update required: uncomment this whenever it is added from backend
    // required: "Preffered contact method is required",
  },
  state: {
    required: "This field is required",
  },
  city: {
    required: "City is required",
  },
};

export const CompanySignupValidations = {
  company_name: {
    required: "Company name is required",
  },
  first_name: {
    required: "Contact person's first name is required",
  },
  last_name: {
    required: "Contact person's last name is required",
  },
  email: {
    required: "Email address is required",
    pattern: {
      value: EMAIL_REGEX,
      message: INVALID_EMAIL_MESSAGE,
    },
  },

  phone_number: {
    required: "Phone number is required",
    minLength: {
      value: 10,
      message: "Phone number must be exactly 10 digits",
    },
  },
  company_address: {
    required: "Company address is required",
  },
  zip_code: {
    required: "ZIP code is required",
  },
  business_type: {
    required: "Business type is required",
  },
};

export const ForgetPasswordValidations = {
  email: {
    required: "Email address is required",
    pattern: EMAIL_REGEX,
    message: "Please enter a valid email",
  },
};

export const profileValidations = {
  first_name: {
    required: "First Name is required",
  },
  last_name: {
    required: "Last Name is required",
  },
  email: {
    required: "Email address is required",
    pattern: {
      value: EMAIL_REGEX,
      message: INVALID_EMAIL_MESSAGE,
    },
  },
  phone_number: {
    required: "Phone number is required",
    minLength: {
      value: 10,
      message: "Phone number must be exactly 10 digits",
    },
  },
  old_password: {
    required: "Old password is required",
  },
  new_password: {
    required: "New password is required",
  },
  confirm_password: {
    required: "Confirm password is required",
  },
  address_one: {
    required: "This field is required",
  },
  address_two: {
    required: "This field is required",
  },
  // company_address: {
  //   required: "Company address is required",
  // },
  // zip_code: {
  //   required: "ZIP code is required",
  // },
  // business_type: {
  //   required: "Business type is required",
  // },
};
