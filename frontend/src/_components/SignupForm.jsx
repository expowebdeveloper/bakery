"use client";
import CommonTextInput from "@/_form-fields/CommonTextInput";
import { IndivisualSignupValidations } from "@/_validations/authValidations";
import React, { useState } from "react";
import PasswordSection from "./_common/PasswordSection";
import LocationField from "./_common/LocationField";
import AuthRedirectSection from "./_common/AuthRedirectSection";
import TermsAndConditionsText from "./TermsAndConditionsText";
import { useRouter } from "next/navigation";
import CommonButton from "./_common/CommonButton";
import Cookies from "js-cookie";
import { signUp } from "@/_Api Handlers/apiFunctions";
import { successType, toastMessage } from "@/_utils/toastMessage";
import { DEFAULT_ERROR_MESSAGE, STATE_OPTIONS } from "@/_constants/constant";
import { returnAddressInfo } from "@/_utils/helpers";
import CommonSelect from "@/_form-fields/CommonSelect";
import EmailInput from "@/_form-fields/EmailInput";
import SignupTabs from "./SignupTabs";
import { T } from "@/utils/languageTranslator";
import { BillingDetailsValidations } from "@/_validations/billingDetailsValidations";

const SignupForm = ({
  formConfig,
  activeTab,
  tabOption,
  onSubmit,
  isVerified,
  handleVerifyClick,
  btnLoader = false,
}) => {
  const router = useRouter();
  const {
    handleSubmit,
    watch,
    register,
    setValue,
    formState: { errors },
  } = formConfig;

  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-[720px] space-y-4 font-[sans-serif] text-[#333] mt-4"
      >
        {/* {activeTab === tabOption.company ? ( */}
        <CommonTextInput
          fieldName="company_name"
          formConfig={formConfig}
          type="text"
          placeholder="Enter Company name"
          rules={IndivisualSignupValidations["company_name"]}
          className="common-field"
          label="Company Name"
        />
        <CommonTextInput
          formConfig={formConfig}
          placeholder={T["enter_organization_number"]}
          fieldName="organization_no"
          rules={BillingDetailsValidations?.["organization_number"]}
          isNumberOnly={true}
          label={`${T["organization_number"]} *`}
        />
        <CommonTextInput
          formConfig={formConfig}
          placeholder={T["enter_vat_id"]}
          fieldName="vat_id"
          rules={BillingDetailsValidations?.["vat_id"]}
          label={`${T["vat_id"]} *`}
        />
        {/* // ) : (
        //   ""
        // )} */}

        <div className="form-grid-wrapper">
          {/* section1 */}
          <CommonTextInput
            fieldName="first_name"
            formConfig={formConfig}
            type="text"
            placeholder="Enter first name"
            rules={IndivisualSignupValidations["first_name"]}
            className="common-field"
            label="First Name *"
          />
          <CommonTextInput
            fieldName="last_name"
            formConfig={formConfig}
            type="text"
            placeholder="Enter last name"
            rules={IndivisualSignupValidations["last_name"]}
            className="common-field"
            label="Last Name *"
          />
          {/* section1 */}
          {/* section2 */}
          <EmailInput
            fieldName="email"
            formConfig={formConfig}
            type="text"
            placeholder="Enter your email"
            className="common-field"
            rules={IndivisualSignupValidations["email"]}
            label="Email Address *"
            handleVerifyClick={handleVerifyClick}
            isVerified={isVerified}
            readOnly={true}
          />
          <CommonTextInput
            fieldName="phone_number"
            formConfig={formConfig}
            type="text"
            placeholder="+46 123 456 789 or 012 345 6789"
            className="common-field"
            rules={IndivisualSignupValidations["phone_number"]}
            label="Phone Number *"
            isNumberOnly={true}
            maxLength={10}
          />
          {/* section2 */}
          {/* password section */}
        </div>
        <PasswordSection
          formConfig={formConfig}
          fieldOneName={"password"}
          className="common-field"
          fieldTwoName={"confirm_password"}
        />
        <div className="terms-and-conditions">
          <TermsAndConditionsText
            register={register}
            rules={IndivisualSignupValidations["terms_conditions"]}
            fieldName="terms_and_conditions"
            errors={errors}
          />{" "}
        </div>
        {/* Email Marketing Checkbox (Optional) */}
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("email_marketing")} />
          <span>{T["email_marketing_text"]}</span>
        </label>
        <div className="flex gap-7 items-center">
          <CommonButton
            type="submit"
            className="sign-in-button w-full py-4 mt-4 bg-gray-300 text-gray-600 font-normal mb-2 rounded-md hover:bg-[#5F6F52] max-w-[300px] hover:text-white rounded-[50px] cursor-pointer transition-all duration-400 ease-in-out"
            text="Create an account"
            loader={btnLoader}
          />
          <AuthRedirectSection
            text="Have an account?"
            linkText="Log in"
            linkUrl="/login"
            className="right-align"
          />{" "}
        </div>
      </form>
    </div>
  );
};

export default SignupForm;
