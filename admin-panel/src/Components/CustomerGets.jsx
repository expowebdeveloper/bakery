import React, { useState } from "react";
import CommonAsyncSelect from "../Form Fields/CommonAsyncSelect";
import CommonTextField from "../Form Fields/CommonTextField";
import { ITEMS_FROM_OPTIONS } from "../constant";
import { createRequiredValidation } from "../utils/helpers";
import CommonSelect from "../Form Fields/CommonSelect";
import { makeApiRequest, METHODS } from "../api/apiFunctions";
import { PRODUCT_ENDPOINT, SEARCH_PRODUCT } from "../api/endpoints";

const CustomerGets = ({ formConfig }) => {
  let timer;
  const { watch } = formConfig;
  const customer_buy_types = watch("customer_buy_types");
  const get_applies_to = watch("get_applies_to");
  const [isLoading, setIsLoading] = useState(false);
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
  const NoOptionsMessage = (NoticeProps) => {
    return (
      <p style={{ textAlign: "center", marginTop: "4px", color: "#b2afaf" }}>
        No Result Found
      </p>
    );
  };
  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="title">Customer Gets</div>
      <div className="items-section">
        <CommonSelect
          label="Any Items From *"
          selectType="react-select"
          formConfig={formConfig}
          fieldName="get_applies_to"
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
              fieldName="customer_gets_quantity"
              rules={createRequiredValidation("Quantity")}
              formConfig={formConfig}
            />
          ) : customer_buy_types === "minimum_purchase_amount" ? (
            <CommonTextField
              label="Purchase Amount *"
              placeholder="Enter amount"
              isNumberOnly={true}
              fieldName="customer_gets_quantity"
              rules={createRequiredValidation("Amount")}
              formConfig={formConfig}
            />
          ) : (
            ""
          )}
        </div>
        <div className="product-search">
          {get_applies_to?.value === "specific_products" ? (
            <CommonAsyncSelect
              formConfig={formConfig}
              label=""
              isMulti={true}
              loadOptions={fetchProducts}
              placeholder="Search Product"
              fieldName="customer_get_products"
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

export default CustomerGets;
