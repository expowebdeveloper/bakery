import React, { useEffect, useState } from "react";
import CommonSelect from "../../Form Fields/CommonSelect";
import { APPLIES_TO_OPTIONS } from "../../constant";
import { makeApiRequest, METHODS } from "../../api/apiFunctions";
import { PRODUCT_ENDPOINT, SEARCH_PRODUCT } from "../../api/endpoints";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import CommonAsyncSelect from "../../Form Fields/CommonAsyncSelect";
import { createRequiredValidation } from "../../utils/helpers";

const AppliesTo = ({ formConfig }) => {
  let timer;
  const { watch, setValue } = formConfig;
  const [productName, setProductName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [productOptions, setProductOptions] = useState([]);

  const NoOptionsMessage = (NoticeProps) => {
    return (
      <p style={{ textAlign: "center", marginTop: "4px", color: "#b2afaf" }}>
        No Result Found
      </p>
    );
  };
  useEffect(() => {
    if (watch("applies_to")?.value == "all_products") {
      setValue("specific_products", []);
    }
  }, [watch("applies_to")]);
  console.log(watch("specific_products"), "these are specific products");

  const fetchProducts = (inputValue) => {
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
          params: { search: inputValue },
          method: METHODS.get,
        })
          .then((res) => {
            const results = res?.data?.results;
            const formattedOptions = results?.map((curElem) => ({
              label: curElem?.name,
              value: curElem?.product,
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
  console.log(watch("applies_to"), "these are applies to");

  return (
    <div>
      {" "}
      <div>
        <CommonSelect
          label="Applies To *"
          fieldName="applies_to"
          options={APPLIES_TO_OPTIONS}
          selectType="react-select"
          formConfig={formConfig}
          placeholder="Select"
          className="px-4 py-2 mb-4 w-full rounded-lg bg-[#F5F5F5] custom_discount"
        />
        {watch("applies_to")?.value === "specific_products" && (
          <div className="flex gap-4 flex-col">
            <CommonAsyncSelect
              formConfig={formConfig}
              label="Specify Products "
              isMulti={true}
              loadOptions={fetchProducts}
              placeholder="Search Product"
              fieldName="specific_products"
              rules={createRequiredValidation()}
              noOptionMessage={NoOptionsMessage}
              className="x-4 py-2 mb-4 w-full rounded-lg bg-[#F5F5F5] custom_discount"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AppliesTo;
