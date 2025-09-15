"use client";
import React from "react";
import ErrorMessage from "./ErrorMessage";
import Autocomplete from "react-google-autocomplete";
// add this inside env
const GOOGLE_MAP_API_KEY = "AIzaSyCA-pKaniZ4oeXOpk34WX5CMZ116zBvy-g";
const LocationField = ({
  fieldName,
  options,
  formConfig,
  type = "text",
  label,
  className = "commonInput",
  placeholder,
  rules,
}) => {
  const {
    register,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = formConfig;

  return (
    <div className="w-full">
      <div className="label">{label}</div>
      <Autocomplete
        {...register(fieldName, {
          ...rules,
          onChange: (e) => {
            setValue(fieldName, e.target.value);
            clearErrors(fieldName);
          },
        })}
        apiKey={GOOGLE_MAP_API_KEY}
        onPlaceSelected={(place) => {
          setValue(fieldName, place);
        }}
        options={options}
        value={
          watch(fieldName)?.formatted_address
            ? watch(fieldName)?.formatted_address
            : watch(fieldName)
        }
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        className={className}
      />
      <ErrorMessage fieldName={fieldName} errors={errors} />
    </div>
  );
};

export default LocationField;
