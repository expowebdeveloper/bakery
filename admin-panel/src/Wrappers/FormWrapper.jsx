import React from "react";
import { useForm } from "react-hook-form";
import CommonButton from "../Components/Common/CommonButton";

const FormWrapper = ({
  onSubmit,
  submitButtonText = "Submit",
  children,
  formConfig,
  className = "",
  wrapperClass="",
  isCustomButtons = false, // for this case button will also be passed as children
}) => {
  const { handleSubmit } = formConfig;
  return (
    // <div className={wrapperClass}>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        {/* form fields will come as children */}
        {children}
        {!isCustomButtons && (
          <CommonButton
            type="submit"
            text={submitButtonText}
            className={className}
          />
        )}
      </form>
    // </div>
  );
};

export default FormWrapper;
