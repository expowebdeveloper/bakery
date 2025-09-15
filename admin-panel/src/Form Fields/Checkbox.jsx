import React from "react";
import ErrorMessage from "../Components/Common/ErrorMessage";
const Checkbox = ({
  formConfig,
  fieldName,
  label,
  disabled = false,
  labelClass = "",
  className = "",
}) => {
  const {
    register,
    formState: { errors },
  } = formConfig;
  return (
    <label className={`flex items-center text-gray-700 text-sm ${labelClass}`}>
      <input
        type="checkbox"
        disabled={disabled}
        {...register(fieldName)}
        className={`w-4 h-4 text-blue-600 focus:ring-blue-500 rounded border-gray-300 mr-2`}
      />
      {label}
      <ErrorMessage fieldName={fieldName} errors={errors} />
    </label>
  );
};

export default Checkbox;
