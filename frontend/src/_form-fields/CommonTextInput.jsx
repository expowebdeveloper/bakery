"use client";
import ErrorMessage from "@/_components/_common/ErrorMessage";
import React from "react";

const DEFAULT_CLASS =
  "px-4 py-3 bg-gray-100 focus:bg-transparent w-full text-sm outline-[#333] rounded-sm transition-all";

const CommonTextInput = ({
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
}) => {
  const {
    register,
    formState: { errors },
    setValue,
  } = formConfig;
  return (
    <div className="relative">
      <div className="label mb-[7px]">{label}</div>
      {isNumberOnly ? (
        <input
          {...register(fieldName, {
            ...rules,
            onChange: (e) => {
              const numbersOnly = e.target.value.replace(/[^0-9]/g, "");
              setValue(fieldName, numbersOnly);
            },
          })}
          type={type}
          placeholder={placeholder}
          className={className}
          maxLength={maxLength}
        />
      ) : type === "textarea" ? (
        <textarea
          {...register(fieldName, rules)}
          type={type}
          placeholder={placeholder}
          className={className}
          maxLength={maxLength}
          rows={rows}
        />
      ) : (
        <input
          {...register(fieldName, rules)}
          type={type}
          placeholder={placeholder}
          className={className}
          maxLength={maxLength}
        />
      )}

      <div className="icon absolute right-5 -translate-y-1/2" onClick={onIconClick}>
        {icon}
      </div>
      <ErrorMessage fieldName={fieldName} errors={errors} />
    </div>
  );
};

export default CommonTextInput;
