import React, { useEffect, useState } from "react";
import { CUSTOMER_BUYS_OPTIONS, ITEMS_FROM_OPTIONS } from "../constant";
import { createRequiredValidation } from "../utils/helpers";
import RadioGroup from "../Form Fields/RadioGroup";
import CommonSelect from "../Form Fields/CommonSelect";
import CommonTextField from "../Form Fields/CommonTextField";
import CommonAsyncSelect from "../Form Fields/CommonAsyncSelect";
import { makeApiRequest, METHODS } from "../api/apiFunctions";
import { PRODUCT_ENDPOINT, SEARCH_PRODUCT } from "../api/endpoints";

const CustomerBuys = ({ formConfig }) => {
  let timer;
  const { watch, setValue, clearErrors, buy_products } = formConfig;
  const customer_buy_types = watch("customer_buy_types");
  const applies_to = watch("applies_to");
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (customer_buy_types === "minimum_items_quantity") {
      setValue("buy_products_quantity", "");
      setValue("customer_gets_amount", "");
      clearErrors("buy_products_quantity");
      clearErrors("customer_gets_amount");
    } else {
      setValue("buy_products_quantity", "");
      clearErrors("customer_gets_quantity");
      setValue("customer_gets_quantity", "");
      clearErrors("buy_products_quantity");
    }
  }, [customer_buy_types]);
  useEffect(() => {
    applies_to?.value === "all_product" && setValue("buy_products", []);
  }, [applies_to]);
  console.log(buy_products, "buy_products");
  const NoOptionsMessage = (NoticeProps) => {
    return (
      <p style={{ textAlign: "center", marginTop: "4px", color: "#b2afaf" }}>
        No Result Found
      </p>
    );
  };

  const fetchProducts = (inputValue) => {
    console.log(inputValue, "inputValue");
    return new Promise((resolve, reject) => {
      if (!inputValue) {
        resolve([]);
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsLoading(true);
        makeApiRequest({
          endPoint: SEARCH_PRODUCT,
          params: { name: inputValue },
          method: METHODS.get,
        })
          .then((res) => {
            const results = res?.data?.results;
            const formattedOptions = results?.map((curElem) => ({
              label: curElem?.name,
              value: curElem?.id,
            }));
            resolve(formattedOptions);
          })
          .catch((err) => {
            console.error(err);
            reject(err);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }, 500);
    });
  };
  return (
    <div className="bg-white p-6 rounded-lg">
      <RadioGroup
        className="flex gap-4"
        label="Customer Buys *"
        fieldName="customer_buy_types"
        formConfig={formConfig}
        options={CUSTOMER_BUYS_OPTIONS}
        rules={createRequiredValidation("")}
      />
      <div className="items-section">
        <CommonSelect
          label="Any Items From *"
          selectType="react-select"
          formConfig={formConfig}
          fieldName="applies_to"
          rules={createRequiredValidation("")}
          options={ITEMS_FROM_OPTIONS}
          className="mt-2 border-2 border-solid border-black-500 rounded"
          placeholder="Select"
        />
        <div className="quantity">
          {customer_buy_types === "minimum_items_quantity" ? (
            <CommonTextField
              label="Quantity *"
              placeholder="Enter Quantity"
              isNumberOnly={true}
              fieldName="buy_products_quantity"
              rules={createRequiredValidation("Quantity")}
              formConfig={formConfig}
            />
          ) : customer_buy_types === "minimum_purchase_amount" ? (
            <CommonTextField
              label="Purchase Amount *"
              placeholder="Enter Amount"
              isNumberOnly={true}
              fieldName="buy_products_quantity"
              rules={createRequiredValidation("Amount")}
              formConfig={formConfig}
            />
          ) : (
            ""
          )}
        </div>
        <div className="product-search">
          {applies_to?.value === "specific_products" ? (
            <CommonAsyncSelect
              formConfig={formConfig}
              label=""
              isMulti={true}
              loadOptions={fetchProducts}
              placeholder="Search Product"
              fieldName="buy_products"
              rules={createRequiredValidation()}
              isLoading={isLoading}
              noOptionMessage={NoOptionsMessage}
              className="x-4 py-2 mb-4 w-full rounded-lg bg-[#F5F5F5] mt-4"
            />
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerBuys;
