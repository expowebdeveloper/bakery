import React from "react";
import ErrorMessage from "../Components/Common/ErrorMessage";
import { DEFAULT_CLASS } from "../constant";
import GenrateRandomCode from "../Components/Common/GenrateRandomCode";
import { BUTTON_LOADER, passwordInfoIcon, questionIcon } from "../assets/Icons/Svg";
import { Tooltip } from "react-tooltip";
import { T } from "../utils/languageTranslator";

const CommonTextField = ({
  rules,
  fieldName,
  showTooltip = false,
  formConfig,
  type = "text",
  placeholder,
  className = DEFAULT_CLASS,
  label,
  icon,
  onIconClick,
  maxlength = null,
  rows = null,
  customError = null,
  labelClassName = "",
  disabled = false,
  isNumberOnly = false,
  isDecimal = false,
  customClass = "w-full",
  isDiscountCode = false,
  onCreateSlug = () => { },
  showSlug = false,
  generateId = false,
  onGenerateId,
  isSku = false,
  onCreateSku = () => { },
  employeeLoader,
  //Number only will used for phone number inputs only and will not include any decimal ,
  // for decimal values like currency etc. will use isDecimal
}) => {
  const {
    register,
    formState: { errors },
    setValue,
    watch
  } = formConfig;
  return (
    <div className="w-full">
      <div className="code-section flex justify-between items-center mb-2">
        <label
          className={`${labelClassName} text-[16px] text-[#3E3232] font-[600] flex items-center gap-2s`}
        >
          {label}
          {showTooltip && (
            <>
              <div className="password-info-icon w-5 ml-2 cursor-pointer" data-tooltip-id="password-rules">
                {passwordInfoIcon}
              </div>
              <Tooltip
                id="password-rules"
                place="top"
                content={T["password_validation_tooltip"]}
                className="password-info-tooltip"
                style={{
                  maxWidth: "500px"
                }}
              />
            </>
          )}
        </label>
        {isDiscountCode && (
          <>
            <GenrateRandomCode setValue={setValue} fieldName="code" />
          </>
        )}
        {isSku && (
          <div
            className="text-[#FF6D2F] underline cursor-pointer text-[14px]"
            onClick={onCreateSku}
          >
            Generate SKU
          </div>
        )}
        {showSlug ? (
          <div
            className="text-[#FF6D2F] underline cursor-pointer text-[14px]"
            onClick={onCreateSlug}
          >
            Generate Slug
          </div>
        ) : (
          ""
        )}
        {(generateId && !watch("employee_id")) ? (
          <div
            className="text-[#FF6D2F] underline cursor-pointer text-[14px]"
            onClick={employeeLoader ? () => { } : onGenerateId}
          >
            {"Generate Employee ID"} {employeeLoader ? BUTTON_LOADER : ""}
          </div>
        ) : (
          ""
        )}
      </div>
      <div className={`common-field relative ${customClass}`}>
        {isNumberOnly || isDecimal ? (
          <input
            {...register(fieldName, {
              ...rules,
              onChange: (e) => {
                const { value } = e.target;
                const numbersOnly = value.replace(/[^0-9]/g, "");
                const decimalOnly = value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, '$1'); // Allow only one decimal point
                setValue(fieldName, isDecimal ? decimalOnly : numbersOnly);
              },
            })}
            type={type}
            placeholder={placeholder}
            className={className}
            maxlength={maxlength}
            disabled={disabled}
          />
        ) : type === "textarea" ? (
          <textarea
            {...register(fieldName, rules)}
            type={type}
            placeholder={placeholder}
            className={className}
            maxlength={maxlength}
            rows={rows}
            disabled={disabled}
          />
        ) : (
          <input
            {...register(fieldName, rules)}
            type={type}
            placeholder={placeholder}
            className={className}
            maxlength={maxlength}
            disabled={disabled}
          />
        )}

        <div className="icon absolute right-5 top-[17px]" onClick={onIconClick}>
          {icon}
        </div>
      </div>

      {customError ? (
        <p className="text-red-600 error-text">{customError}</p>
      ) : (
        <ErrorMessage fieldName={fieldName} errors={errors} />
      )}
    </div>
  );
};

export default CommonTextField;
