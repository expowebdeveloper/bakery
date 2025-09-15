import React from "react";
import { Controller } from "react-hook-form";
import Select from "react-select";
import ErrorMessage from "../Components/Common/ErrorMessage";
import CreatableSelect from "react-select/creatable";
// Note :  options must be an array of object with object containing label and value keys

const CommonSelect = ({
  className = "",
  customError = false,
  label,
  formConfig,
  fieldName,
  rules,
  options,
  disabled = false,
  placeholder = "",
  isMulti = false,
  labelClassName = "text-[16px] text-[#3E3232] font-[600]",
  isSearchable = true,
  handleCreateOption = () => {},
  closeMenuOnSelect = true,
  defaultOption = "", // will be required for normal select only
  selectType, // will contain these (creatable:for creatable select), (normal:for normal select) and (react-select:for react select)
}) => {
  const {
    control,
    register,
    formState: { errors },
  } = formConfig;

  const renderFieldAccordingToType = () => {
    switch (selectType) {
      case "creatable":
        return (
          <Controller
            name={fieldName}
            control={control}
            rules={rules}
            className="px-4 py-3 bg-gray-100"
            render={({ field }) => (
              <>
                <CreatableSelect
                  {...field}
                  options={options}
                  isDisabled={disabled}
                  isMulti={isMulti}
                  isSearchable={isSearchable}
                  placeholder={placeholder}
                  onChange={(selected) => field.onChange(selected)}
                  value={field.value}
                  closeMenuOnSelect={closeMenuOnSelect} // Keeps the menu open after selection
                  onBlur={field.onBlur}
                  className={className}
                  // noOptionsMessage={() => "No options available"}
                />
              </>
            )}
          />
        );
      case "normal":
        return (
          <>
            <select
              disabled={disabled}
              className={className}
              {...register(fieldName, rules)}
            >
              <option selected hidden value="" disabled>
                {defaultOption}
              </option>
              {options?.map(({ value, label }) => (
                <option value={value}>{label}</option>
              ))}
            </select>
          </>
        );
      default:
        return (
          <>
            <Controller
              name={fieldName}
              control={control}
              rules={rules}
              render={({ field }) => (
                <>
                  <Select
                    className={className}
                    {...field}
                    options={options}
                    isMulti={isMulti}
                    isSearchable={isSearchable}
                    isDisabled={disabled}
                    placeholder={placeholder}
                    onChange={(selected) => field.onChange(selected)}
                    value={field.value}
                    closeMenuOnSelect={closeMenuOnSelect} // Keeps the menu open after selection
                    onBlur={field.onBlur}
                    // noOptionsMessage={() => "No options available"}
                  />
                </>
              )}
            />
          </>
        );
    }
  };
  return (
    <div>
      <div className={`${labelClassName} label mb-2`}>{label}</div>
      {renderFieldAccordingToType()}
      {customError ? (
        <p className="text-red-600 error-text">{customError}</p>
      ) : (
        <ErrorMessage fieldName={fieldName} errors={errors} />
      )}
    </div>
  );
};

export default CommonSelect;
