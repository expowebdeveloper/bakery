import React, { useState, useEffect } from "react";
import { Controller } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import ErrorMessage from "../Components/Common/ErrorMessage";

const InfiniteCreatableSelect = ({
  label,
  options = [],
  loadMoreOptions,
  hasMore,
  handleCreateOption,
  placeholder = "Select or create",
  isMulti = false,
  isSearchable = true,
  closeMenuOnSelect = true,
  className = "",
  fieldName,
  formConfig,
  customError = "",
  isLoading = false,
  setIsLoading = () => {}
}) => {
  const { control, rules, formState: { errors }, setValue, watch } = formConfig;
  const [selectOptions, setSelectOptions] = useState(options);

  useEffect(() => {
    setSelectOptions(options);
  }, [options]);

  const handleScroll = (event) => {
    const bottom =
      event.target.scrollHeight - event.target.scrollTop ===
      event.target.clientHeight;
    if (bottom && hasMore && !isLoading) {
      setIsLoading(true);
      loadMoreOptions()
    }
  };

  const handleCreate = async (inputValue) => {
    const newOption = await handleCreateOption(inputValue);
    if (newOption) {
      setSelectOptions((prev) => [...prev, newOption]);
      if (isMulti) {
        setValue(fieldName, [...(watch(fieldName) || []), newOption]);
      } else {
        setValue(fieldName, newOption);
      }
    }
  };

  return (
    <div>
      {label && (
        <div className="text-[16px] text-[#3E3232] font-[600] mb-2">
          {label}
        </div>
      )}
      <Controller
        name={fieldName}
        control={control}
        rules={rules}
        className="px-4 py-3 bg-gray-100"
        render={({ field }) => (
          <>
            <CreatableSelect
              {...field}
              options={selectOptions}
              isMulti={isMulti}
              isSearchable={isSearchable}
              placeholder={placeholder}
              closeMenuOnSelect={closeMenuOnSelect}
              onCreateOption={handleCreate}
              onMenuScrollToBottom={handleScroll}
              className={className}
              isLoading={isLoading}
            />
          </>
        )}
      />

      {customError ? (
        <p className="text-red-600 error-text">{customError}</p>
      ) : (
        <ErrorMessage fieldName={fieldName} errors={errors} />
      )}

    </div>
  );
};

export default InfiniteCreatableSelect;
