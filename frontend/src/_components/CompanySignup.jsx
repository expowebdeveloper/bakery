"use client";
import CommonTextInput from "@/_form-fields/CommonTextInput";
import { CompanySignupValidations } from "@/_validations/authValidations";
import React from "react";
import { useForm } from "react-hook-form";
import PasswordSection from "./_common/PasswordSection";
import LocationField from "./_common/LocationField";
import TermsAndConditionsText from "./TermsAndConditionsText";
import AuthRedirectSection from "./_common/AuthRedirectSection";
import CommonButton from "./_common/CommonButton";

const CompanySignup = () => {
  const formConfig = useForm();
  const { handleSubmit, watch, register } = formConfig;
  const onSubmit = (values) => {
    console.log(values, "company signup values on submit");
  };
  return (
    <div>
      {" "}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-md mx-auto space-y-4 font-[sans-serif] text-[#333] mt-4"
      >
        <h1 className="text-xl font-bold">Sign Up!</h1>
        <CommonTextInput
          fieldName="company_name"
          formConfig={formConfig}
          type="text"
          placeholder="Enter company name"
          rules={CompanySignupValidations["company_name"]}
          label="Company Name"
        />
        <CommonTextInput
          fieldName="first_name"
          formConfig={formConfig}
          type="text"
          placeholder="Enter first name"
          rules={CompanySignupValidations["first_name"]}
          label="Contact Person's First Name"
        />
        <CommonTextInput
          fieldName="last_name"
          formConfig={formConfig}
          type="text"
          placeholder="Enter last name"
          rules={CompanySignupValidations["last_name"]}
          label="Contact Person's Last Name"
        />
        <CommonTextInput
          fieldName="email"
          formConfig={formConfig}
          type="text"
          placeholder="Enter email"
          rules={CompanySignupValidations["email"]}
          label="Company Email Address"
        />
        <CommonTextInput
          fieldName="phone_number"
          formConfig={formConfig}
          type="text"
          placeholder="Enter phone number"
          rules={CompanySignupValidations["phone_number"]}
          label="Phone Number"
          isNumberOnly={true}
        />
        <PasswordSection
          formConfig={formConfig}
          fieldOneName={"password"}
          fieldTwoName={"confirm_password"}
        />
        <LocationField
          fieldName="company_address"
          formConfig={formConfig}
          rules={CompanySignupValidations["company_address"]}
          placeholder="Enter Company Address"
          label="Company Address"
        />
        <CommonTextInput
          fieldName="zip_code"
          formConfig={formConfig}
          type="text"
          placeholder="Enter zip code"
          rules={CompanySignupValidations["zip_code"]}
          label="ZIP code"
          isNumberOnly={true}
        />
        <CommonTextInput
          fieldName="business_type"
          formConfig={formConfig}
          type="text"
          placeholder="Enter business type"
          rules={CompanySignupValidations["business_type"]}
          label="Business Type"
        />
        <TermsAndConditionsText
          register={register}
          fieldName={"terms_and_conditions"}
        />
        <CommonButton
          type="submit"
          className="sign-in-button"
          text="Create an account"
        />
        <AuthRedirectSection
          text="Have an account?"
          linkText="Log in"
          linkUrl="/login"
          className="text-right"
        />{" "}
      </form>
    </div>
  );
};

export default CompanySignup;
