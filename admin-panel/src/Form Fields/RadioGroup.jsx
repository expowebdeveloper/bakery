import React, { Fragment } from "react";
import ErrorMessage from "../Components/Common/ErrorMessage";
// options must be an array of object and the object must contain label and value keys
const RadioGroup = ({
  formConfig,
  fieldName,
  options,
  label,
  rules,
  className,
  disabled = false,
  labelClassName=""
}) => {
  const {
    register,
    formState: { errors },
  } = formConfig;
  return (
    <div>
      <div className={`label ${labelClassName}`}>{label}</div>
      <div className={className}>
        {options?.map(({ value, label: optionLabel }, idx) => (
          <div key={idx} className="flex gap-4">
            <label className="flex gap-1 cursor-pointer">
              <input
                disabled={disabled}
                {...register(fieldName, rules)}
                type="radio"
                value={value}
              />
              <div className="option-label">{optionLabel}</div>
            </label>
          </div>
        ))}
      </div>
      <ErrorMessage errors={errors} fieldName={fieldName} />
    </div>
  );
};

export default RadioGroup;
