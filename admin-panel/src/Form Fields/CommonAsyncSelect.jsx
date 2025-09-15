import React from "react";
import { Controller } from "react-hook-form";
import AsyncSelect from "react-select/async";
import ErrorMessage from "../Components/Common/ErrorMessage";

const CommonAsyncSelect = ({
  formConfig,
  fieldName,
  label,
  isMulti = false,
  noOptionMessage,
  rules,
  loadOptions,
  placeholder = "Search",
  className = "",
  isLoading = false,
}) => {
  const {
    control,
    formState: { errors },
  } = formConfig;
  return (
    <>
      <label>{label}</label>
      <Controller
        name={fieldName}
        rules={rules}
        control={control}
        render={({ field }) => (
          <AsyncSelect
            {...field}
            noOptionMessage={noOptionMessage}
            isMulti={isMulti}
            cacheOptions
            loadOptions={loadOptions}
            isLoading={isLoading}
            placeholder={placeholder}
            className={className}
            // onKeyDown={(e) => {
            //   if (e.key === "Enter") {
            //     e.preventDefault();
            //   }
            // }}
          />
        )}
      />
      <ErrorMessage fieldName={fieldName} errors={errors} />
    </>
  );
};

export default CommonAsyncSelect;
