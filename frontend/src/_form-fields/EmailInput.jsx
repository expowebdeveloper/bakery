"use client";
import ErrorMessage from "@/_components/_common/ErrorMessage";
import React,{useState} from "react";

const DEFAULT_CLASS =
  "px-4 py-3 bg-gray-100 focus:bg-transparent w-full text-sm outline-[#333] rounded-sm transition-all";

const EmailInput = ({
  rules,
  fieldName,
  formConfig,
  type = "text",
  placeholder,
  className = "commonInput",
  label,
  icon,
  onIconClick,
  isNumberOnly = false,
  maxLength = null,
  rows = null,
  readOnly = false
  // isVerified,
  // handleVerifyClick,
}) => {
  const {
    register,
    formState: { errors },
    setValue,
  } = formConfig;
  return (
    <div className="relative">
      <div className="label mb-[7px]">{label}</div>
        <input
          {...register(fieldName, rules)}
          type={type}
          placeholder={placeholder}
          className={className}
          maxLength={maxLength}
          readOnly={readOnly}
        />
      <div className="icon absolute right-5 -translate-y-1/2" onClick={onIconClick}>
        {icon}
      </div>
      {/* <div className="absolute right-2 top-2/3 -translate-y-1/2">
        {isVerified ? (
          <span className="text-green-500">✔</span> // Tick icon
        ) : (
          <button
            type="button"
            className="text-blue-500 underline"
            onClick={handleVerifyClick}
          >
            Verify
          </button>
        )}
      </div> */}
      <ErrorMessage fieldName={fieldName} errors={errors} />
    </div>
  );
};

export default EmailInput;
