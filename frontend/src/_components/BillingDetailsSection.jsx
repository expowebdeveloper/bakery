"use client";
import CommonTextInput from "@/_form-fields/CommonTextInput";
import { BillingDetailsValidations } from "@/_validations/billingDetailsValidations";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import LocationField from "./_common/LocationField";
import CommonButton from "./_common/CommonButton";
import { SWEDEN_COUNTY_OPTIONS } from "@/_constants/constant";
import CommonSelect from "@/_form-fields/CommonSelect";
import { callApi, METHODS } from "@/_Api Handlers/apiFunctions";
import { CHECK_ZIP } from "@/_Api Handlers/endpoints";
import { toastMessage } from "@/_utils/toastMessage";
import { returnAddressInfo } from "@/_utils/helpers";

const BillingDetailsSection = ({ formConfig }) => {
  // const formConfig = useForm();
  // const { handleSubmit } = formConfig;
  // const onSubmit = (values) => {
  //   console.log(values, "billing details");
  // };

  const { watch, setError, clearErrors, setValue } = formConfig;

  const watchedAddress = watch("address");

  useEffect(() => {
    if (watchedAddress?.address_components) {
      const { state, city } = returnAddressInfo(
        watchedAddress.address_components
      );
      setValue("state", { label: state, value: state });
      setValue("city", city);
    }
  }, [watchedAddress, setValue]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      const zipCode = watch("zip_code");
      if (zipCode) {
        const payload = { zipcode: zipCode };
        callApi({
          endPoint: CHECK_ZIP,
          method: METHODS.post,
          payload: payload,
        })
          .then((response) => {
            toastMessage(response.data?.delivery_message, "success");
            clearErrors("zip_code");
          })
          .catch((err) => {
            console.error("Error validating zip code:", err);
            toastMessage(err.response?.data?.message, "error");
            setError("zip_code", {
              type: "manual",
              message: "Please enter a valid zip code.",
            });
          });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceTimeout);
  }, [watch("zip_code")]);

  return (
    <>
      <h2 className="text-xl font-semibold">Billing Details</h2>
      <div className="font-sans w-full mx-auto p-6 bg-[#ffffff] shadow-md rounded-lg border">
        {/* <form onSubmit={handleSubmit(onSubmit)}> */}
        {/* Billing Details Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CommonTextInput
            formConfig={formConfig}
            placeholder="Enter Name"
            fieldName={"name"}
            rules={BillingDetailsValidations?.["name"]}
            label="Name"
          />
          <CommonTextInput
            formConfig={formConfig}
            placeholder="Enter Mobile Number"
            fieldName={"phone_number"}
            rules={BillingDetailsValidations?.["phone_number"]}
            label="Mobile Number"
            isNumberOnly={true}
            maxLength={10}
          />
          <CommonTextInput
            formConfig={formConfig}
            placeholder="Enter Email"
            fieldName={"email"}
            rules={BillingDetailsValidations?.["email"]}
            label="Email"
          />
          {/* <CommonTextInput
            formConfig={formConfig}
            placeholder="Enter City"
            fieldName={"city"}
            rules={BillingDetailsValidations?.["city"]}
            label="City"
          /> */}
          <LocationField
            fieldName="address"
            formConfig={formConfig}
            rules={BillingDetailsValidations["address"]}
            placeholder="Enter Address"
            label="Address"
            options={{
              types: ["address"], // Ensures a detailed address, including postal codes
              componentRestrictions: { country: ["se"] }, // Restrict to Sweden
            }}
          />
          <CommonTextInput
            fieldName="city"
            formConfig={formConfig}
            placeholder="Enter City"
            label="City *"
            rules={BillingDetailsValidations["city"]}
            // options={{
            //   types: ["(cities)"],
            //   componentRestrictions: { country: ["se"] },
            // }}
          />
          {/* <CommonTextInput
            formConfig={formConfig}
            placeholder="Enter State"
            fieldName={"state"}
            rules={BillingDetailsValidations?.["state"]}
            label="State"
          /> */}
          <CommonSelect
            formConfig={formConfig}
            label="State *"
            selectType="react-select"
            placeholder="Select State"
            options={SWEDEN_COUNTY_OPTIONS}
            fieldName="state"
            rules={BillingDetailsValidations["state"]}
            // className="add-edit-input"
          />
          <CommonTextInput
            formConfig={formConfig}
            placeholder="Enter Zip Code"
            fieldName={"zip_code"}
            rules={BillingDetailsValidations?.["zip_code"]}
            label="Zipcode"
            isNumberOnly={true}
            maxLength={6}
          />
        </div>
        {/* <textarea
          placeholder="Address *"
          className="w-full p-3 mt-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
          rows="3"
          required
        ></textarea> */}
        {/* </form> */}
      </div>
    </>
  );
};

export default BillingDetailsSection;
