import React from "react";
import ErrorMessage from "../Components/Common/ErrorMessage";

const CheckboxGroup = ({
  formConfig,
  fieldName,
  options,
  label,
  rules,
  className = "",
  labelClassName=""

}) => {
  const {
    register,
    formState: { errors },
  } = formConfig;
  return (
    <div>
      <div className={`${labelClassName}`}>{label}</div>
      <div className={className}>
        {options?.map(({ value, label: optionLabel }, idx) => (
          <div key={idx} className="flex gap-4">
            <label>
              <input
                {...register(fieldName, rules)}
                type="checkbox"
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

export default CheckboxGroup;
