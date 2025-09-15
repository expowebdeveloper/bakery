import React, { Fragment } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import CommonButton from "./CommonButton";
import { crossIcon, plusIcon } from "../../assets/Icons/Svg";
import CommonTextField from "../../Form Fields/CommonTextField";
import CommonSelect from "../../Form Fields/CommonSelect";
import { createRequiredValidation } from "../../utils/helpers";

const CommonFieldArray = ({
  heading,
  fieldArrayName,
  formConfig,
  items,
  itemToAppend,
  disabled = false,
}) => {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = formConfig;
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName,
  });

  return (
    <div className="flex flex-col gap-4 justify-start items-start">
      <h4 className="font-bold">{heading}</h4>
      {fields?.map((field, index) => (
        <div
          key={field.id}
          className="flex space-x-4 items-end w-full xl-flex-col justify-between"
        >
          {items?.map(
            (
              {
                label,
                fieldName,
                placeholder,
                isRequired,
                field_type,
                options,
                isNumberOnly = false,
              },
              itemIndex
            ) => (
              <>
                {field_type === "stepCount" ? (
                  <div className="w-full">
                    {/* update required , you will need to add step_count value while creating payload */}
                    <p>{label}</p>
                    <Controller
                      control={control}
                      name={`${fieldArrayName}.${index}.${fieldName}`}
                      render={({ field }) => (
                        <input
                          {...field}
                          className=" recipe-input"
                          value={index + 1}
                          disabled={true}
                        />
                      )}
                    />
                  </div>
                ) : field_type === "react-select" ? (
                  <div className="w-full dietry-section">
                    <CommonSelect
                      label={label}
                      fieldName={`${fieldArrayName}.${index}.${fieldName}`}
                      placeholder={placeholder}
                      options={options}
                      selectType={field_type}
                      rules={createRequiredValidation("Unit of measure")}
                      formConfig={formConfig}
                      customError={
                        errors?.[fieldArrayName]?.[index]?.[fieldName]?.message
                      }
                      className="bg-[#e3e3e3] w-full border border-gray-300 rounded-md focus:outline-none"
                    />
                  </div>
                ) : (
                  <CommonTextField
                    fieldName={`${fieldArrayName}.${index}.${fieldName}`}
                    formConfig={formConfig}
                    label={label}
                    placeholder={placeholder}
                    className="recipe-input"
                    isNumberOnly={isNumberOnly}
                    isDecimal={fieldName === "quantity"}
                    rules={{
                      required: isRequired ? "This field is required" : false,
                    }}
                    key={itemIndex}
                    disabled={disabled}
                    customError={
                      errors?.[fieldArrayName]?.[index]?.[fieldName]?.message
                    }
                  />
                )}
              </>
            )
          )}
          {watch(fieldArrayName)?.length !== 1 && (
            <CommonButton
              icon={crossIcon}
              type="button"
              onClick={() => remove(index)}
              className="cross-icon"
              disabled={disabled}
            />
          )}
        </div>
      ))}
      {!disabled && (
        <CommonButton
          text="Add Row"
          icon={plusIcon}
          onClick={() => append(itemToAppend)}
          type="button"
          className="add-row-button p-6"
        />
      )}
    </div>
  );
};

export default CommonFieldArray;
