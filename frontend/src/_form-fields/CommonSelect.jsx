import ErrorMessage from "@/_components/_common/ErrorMessage";
import React from "react";
import { Controller } from "react-hook-form";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
// Note :  options must be an array of object with object containing label and value keys

const CommonSelect = ({
  className = "commonInput",
  label,
  formConfig,
  fieldName,
  rules,
  options,
  placeholder = "",
  isMulti = false,
  isSearchable = true,
  closeMenuOnSelect = true,
  defaultOption = "", // will be required for normal select only
  selectType, // will contain these (createable:for creatable select), (normal:for normal select) and (react-select:for react select)
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
            render={({ field }) => (
              <>
                <CreatableSelect
                  {...field}
                  options={options}
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
            <select className={className} {...register(fieldName, rules)}>
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
      <div className="label">{label}</div>
      {renderFieldAccordingToType()}
      <ErrorMessage errors={errors} fieldName={fieldName} />
    </div>
  );
};

export default CommonSelect;
