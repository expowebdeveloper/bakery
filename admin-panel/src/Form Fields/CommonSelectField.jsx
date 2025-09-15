import React from "react";

const CommonSelectField = ({
  formConfig,
  fieldName,
  options,
  defaultOption,
  rules,
  className = "commonInput",
}) => {
  const { register } = formConfig;
  return (
    <div>
      <select className={className}>
        <option value="" selected hidden disabled>
          {defaultOption}
        </option>
        {options?.map(({ value, label }, idx) => (
          <option key={idx} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CommonSelectField;
