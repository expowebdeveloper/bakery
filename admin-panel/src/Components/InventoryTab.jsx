import React, { useState } from "react";
import CommonTextField from "../Form Fields/CommonTextField";
import { createRequiredValidation } from "../utils/helpers";
import CommonDateField from "../Form Fields/CommonDateField";
import CommonSelect from "../Form Fields/CommonSelect";
import { MEASURE_OPTIONS } from "../constant";
import CommonFieldArray from "./Common/CommonFieldArray";
import { SPECIAL_CHARACTERS_REGEX } from "../regex/regex";
import ErrorMessage from "./Common/ErrorMessage";
import { T } from "../utils/languageTranslator";
import { generateSku } from "../api/apiFunctions";
const InventoryTab = ({
  formConfig,
  disabled,
  showDateSection,
  setShowDateSection,
}) => {
  const {
    watch,
    register,
    setValue,
    formState: { errors },
    setError,
    clearErrors,
  } = formConfig;

  const BULKING_PRICE_ITEMS = [
    {
      fieldName: "quantity_from",
      placeholder: T["enter_quantity_from"],
      label: T["quantity_from"],
      isRequired: true,
      isNumberOnly: true,
    },
    {
      fieldName: "quantity_to",
      placeholder: T["enter_quantity_to"],
      label: T["quantity_to"],
      isRequired: true,
      isNumberOnly: true,
    },
    {
      fieldName: "price",
      placeholder: T["enter_price"],
      label: T["prices"],
      isRequired: true,
    },
  ];
  const BULKING_APPEND_ITEM = {
    quantity_from: null,
    quantity_to: null,
    price: "",
  };

  const handlePriceChange = (value, type) => {
    const sale_price = watch("sale_price");
    if (type === "regular_price" && value !== "") {
      if (value === sale_price) {
        setError("sale_price", {
          type: "manual",
          message: "Regular price and sale price must not be same",
        });
      } else {
        clearErrors("sale_price");
      }
    }
  };
  const handleGenerateSku = () => {
    const product_name = watch("name");
    console.log(product_name, "name");
    if (product_name) {
      generateSku(product_name)
        .then((res) => {
          const sku = res?.data?.sku;
          setValue("sku", sku);
          clearErrors("sku")
        })
        .catch((err) => {
          console.log(err, "err");
        });
    }
  };

  return (
    <div className="w-full">
      <div className="w-full space-y-4">
        <CommonTextField
          label={`${T["sku"]} *`}
          fieldName="sku"
          className="w-full p-2 rounded-md bg-[#F5F5F5] mt-2"
          rules={{
            ...createRequiredValidation("SKU"),
            // pattern: {
            //   value: SPECIAL_CHARACTERS_REGEX,
            //   message: "Special characters are not allowed",
            // },
          }}
          formConfig={formConfig}
          placeholder={T["enter_sku"]}
          disabled={true}
          isSku={watch("name")}
          onCreateSku={handleGenerateSku}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Regular Price Input */}
          <div>
            <label>{`${T["regular_price"]} *`}</label>
            <input
              {...register("regular_price", {
                required: "Regular price is required",
                onChange: (e) => {
                  const numberOnly = e.target.value.replace(/[^0-9]/g, "");
                  handlePriceChange(e.target.value, "regular_price");
                  setValue("regular_price", numberOnly);
                },
              })}
              type="text"
              placeholder={T["enter_regular_price"]}
              className="w-full p-2 rounded-md bg-[#F5F5F5] mt-2"
              disabled={disabled}
            />
            <ErrorMessage fieldName="regular_price" errors={errors} />
          </div>
          {/* need to add schedule sale yet */}
          {/* <CommonTextField
            label="Sale Price ($) *"
            fieldName="sale_price"
            className="w-full p-2 rounded-md bg-[#F5F5F5] mt-2"
            rules={{
              ...createRequiredValidation("Sale Price"),
              maxLength: {
                value: 8,
                message: "Sale price must not be more than 8 digits in total",
              },
            }}
            formConfig={formConfig}
            isNumberOnly={true}
            placeholder="Enter Sale Price"
            disabled={disabled}
          /> */}
          {/* Sale Price Input */}
          <div>
            <div className="w-full">
              <div className="code-section flex justify-between items-center mb-2">
                <label>{`${T["sale_price"]} *`}</label>
                {!showDateSection ? (
                  <div
                    className="text-[#FF6D2F] underline cursor-pointer text-[14px]"
                    onClick={() => {
                      setShowDateSection(true);
                    }}
                  >
                    Schedule Sale
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
            <input
              {...register("sale_price", {
                required: "Sale price is required",
                onChange: (e) => {
                  const numberOnly = e.target.value.replace(/[^0-9]/g, "");
                  handlePriceChange(e.target.value, "sale_price");
                  setValue("sale_price", numberOnly);
                },
                validate: (value) => {
                  const regularPrice = watch("regular_price");
                  if (!regularPrice) {
                    return "Please enter the regular price first.";
                  }
                  if (Number(value) >= Number(regularPrice)) {
                    return "Sale price must be less than regular price.";
                  }
                  return true;
                },
              })}
              type="text"
              placeholder={T["enter_sale_price"]}
              className="w-full p-2 rounded-md bg-[#F5F5F5] mt-2"
              disabled={disabled}
            />
            <ErrorMessage fieldName="sale_price" errors={errors} />
          </div>
        </div>

        {showDateSection ? (
          <div className="grid grid-cols-2 gap-4">
            <CommonDateField
              label={`${T["sale_price_date_from"]}`}
              fieldName="sale_price_dates_from"
              // rules={createRequiredValidation("Sale price date from")}
              formConfig={formConfig}
              className="w-full p-2 rounded-md bg-[#F5F5F5] mt-2"
              disabled={disabled}
            />
            <CommonDateField
              label={`${T["sale_price_date_to"]}`}
              fieldName="sale_price_dates_to"
              minDate={watch("sale_price_dates_from")}
              disabled={disabled}
              rules={{
                // ...createRequiredValidation("Sale price date to"),
                validate: (value) =>
                  value >= watch("sale_price_dates_from") ||
                  "Sale price end date must be greater than or equal to the start date",
              }}
              formConfig={formConfig}
              className="w-full p-2 rounded-md bg-[#F5F5F5] mt-2"
            />
          </div>
        ) : (
          ""
        )}

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
          <CommonTextField
            label={`${T["weight"]} *`}
            disabled={disabled}
            fieldName="weight"
            className="w-full p-2 rounded-md bg-[#F5F5F5] mt-2"
            rules={createRequiredValidation("Weight")}
            formConfig={formConfig}
            placeholder={T["enter_weight_of_product"]}
            isNumberOnly={true}
          />
          <CommonSelect
            label={`${T["unit"]} *`}
            formConfig={formConfig}
            disabled={disabled}
            fieldName="unit"
            rules={createRequiredValidation("Unit")}
            options={MEASURE_OPTIONS}
            placeholder={T["select_unit_of_product"]}
            className="mt-2 border-2 border-solid border-black-500 rounded"
          />
        </div>
        <div>
          <CommonFieldArray
            heading={T["bulking_pricing_rules"]}
            disabled={disabled}
            fieldArrayName="bulking_price_rules"
            items={BULKING_PRICE_ITEMS}
            itemToAppend={BULKING_APPEND_ITEM}
            formConfig={formConfig}
            className="bg-[#F5F5F5] mt-2"
          />
        </div>
      </div>
    </div>
  );
};

export default InventoryTab;
