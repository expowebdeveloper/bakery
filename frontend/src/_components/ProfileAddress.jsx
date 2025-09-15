"use client";
import React, { useEffect, useState } from "react";
import Location from "../../public/icons/location";
import CommonTextInput from "@/_form-fields/CommonTextInput";
import { useForm } from "react-hook-form";
import { profileValidations } from "@/_validations/authValidations";
import LocationField from "./_common/LocationField";
import { ADDRESS, CHECK_ZIP } from "@/_Api Handlers/endpoints";
import { callApi, METHODS } from "@/_Api Handlers/apiFunctions";
import { INSTANCE } from "@/_Api Handlers/apiConfig";
import { SWEDEN_COUNTY_OPTIONS } from "@/_constants/constant";
import { BillingDetailsValidations } from "@/_validations/billingDetailsValidations";
import CommonSelect from "@/_form-fields/CommonSelect";
import { toastMessage } from "@/_utils/toastMessage";
import { getState } from "@/utils/helpers";
import { returnAddressInfo } from "@/_utils/helpers";
import { T } from "@/utils/languageTranslator";
import { useRouter } from "next/navigation";

const ProfileAddress = ({ addresses, handleDeleteAddress, getAddress }) => {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editID, setEditID] = useState();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const formConfig = useForm();
  const {
    handleSubmit,
    watch,
    register,
    setValue,
    reset,
    setError,
    clearErrors,
  } = formConfig;

  const watchedAddress = watch("address");

  const onSubmit = (values) => {
    const addressInfo = {
      city: "",
      state: "",
    };
    if (isEdit && !values?.address?.address_components) {
      addressInfo.state = watch("state");
      addressInfo.city = watch("city");
    } else {
      const { state, city, country } = returnAddressInfo(
        values?.address?.address_components
      );
      addressInfo.state = state;
      addressInfo.city = city;
    }
    const payload = {
      name: values?.name,
      email: values?.email,
      contact_no: values?.phone_number,
      address: values?.address?.formatted_address || values?.address,
      // city: values?.city?.formatted_address ||values?.city,
      city: values?.city?.formatted_address || values?.city,
      state: values?.state?.value || values?.state,
      // city: addressInfo.city,
      // state: getState(addressInfo?.state),
      zipcode: values?.zip_code,
      // "country": "SE",
      primary: false,
      // adding extra added fields
      // commented for future use 
      // organization_number: values?.organization_number,
      // vat_id: values?.vat_id,
      // company_name: values?.company_name,
    };
    // commented for future use if values will be optional 
    // const extraKeys = ["organization_number", "vat_id", "company_name"];
    // extraKeys.forEach((key) => {
    //   if (values?.[key]) {
    //     payload[key] = values?.[key];
    //   }
    // });
    console.log(payload,"this is payload");


    callApi({
      endPoint: isEdit ? `${ADDRESS}${editID}/` : ADDRESS,
      method: isEdit ? "PATCH" : "POST",
      instanceType: INSTANCE?.authorized,
      payload: payload,
    })
      .then((res) => {
        toastMessage(
          ` Address ${isEdit ? "updated" : "created"} successfully`,
          "success"
        );
        getAddress();
        reset();
        setShowAddressForm(false);
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);
        toastMessage(
          error?.response?.data?.error || "Something went wrong",
          "error"
        );
      });
  };

  useEffect(() => {
    if (watchedAddress?.address_components) {
      const { state, city } = returnAddressInfo(
        watchedAddress.address_components
      );
      setValue("state", { label: state, value: state },{shouldValidate:true});
      setValue("city", city,{shouldValidate:true});
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

  useEffect(() => {
    if (isEdit) {
      callApi({
        endPoint: ADDRESS,
        method: "GET",
        instanceType: INSTANCE?.authorized,
      })
        .then((res) => {
          const primaryAddress = res?.data?.results.find(
            // (address) => address.primary === true
            (address) => address.id === editID
          );
          if (primaryAddress) {
            setValue("name", primaryAddress.name);
            setValue("phone_number", primaryAddress.contact_no);
            setValue("email", primaryAddress.email);
            setValue("city", primaryAddress.city);
            setValue("state", {
              label: primaryAddress.state,
              value: primaryAddress.state,
            });
            setValue("zip_code", primaryAddress.zipcode);
            setValue("address", primaryAddress.address);
            // prefill logic for extra added fields
            // commented for future use 
            // setValue("company_name", primaryAddress.company_name);
            // setValue("oragnization_number", primaryAddress.oragnization_number);
            // setValue("vat_id", primaryAddress.vat_id);
          } else {
            console.error("Primary address not found");
          }
        })
        .catch((error) => {
          console.error("Error adding to cart:", error);
        });
    }
  }, [isEdit, showAddressForm]);

  // const addresses = [
  //   {
  //     address: "Storgatan 45, 2 tr (2nd floor), 123 45 Göteborg, Sweden"
  //   },
  //   {
  //     address: "Storgatan 45, 2 tr (2nd floor), 123 45 Göteborg, Sweden"
  //   },
  //   {
  //     address: "Storgatan 45, 2 tr (2nd floor), 123 45 Göteborg, Sweden"
  //   },
  //   {
  //     address: "Storgatan 45, 2 tr (2nd floor), 123 45 Göteborg, Sweden"
  //   },
  //   {
  //     address: "Storgatan 45, 2 tr (2nd floor), 123 45 Göteborg, Sweden"
  //   },
  //   {
  //     address: "Storgatan 45, 2 tr (2nd floor), 123 45 Göteborg, Sweden"
  //   },
  // ];

  const handleDelete = (id) => {
    setSelectedAddressId(id);
    setShowConfirmationModal(true);
  };

  const confirmDelete = () => {
    callApi({
      endPoint: `${ADDRESS}${selectedAddressId}/`,
      method: "DELETE",
      instanceType: INSTANCE?.authorized,
    })
      .then((res) => {
        toastMessage("Address deleted successfully", "success");
        handleDeleteAddress(selectedAddressId);
        getAddress();
      })
      .catch((error) => {
        console.error("Error getting address:", error);
        toastMessage("Something went wrong", "error");
      });
    setShowConfirmationModal(false);
  };

  // const handleMakeDefault = (id) => {
  //   console.log(`Make card with id: ${id} default`);
  // };

  const handleEdit = (id) => {
    setIsEdit(true);
    setShowAddressForm(true);
    setEditID(id);
  };

  return showAddressForm ? (
    <div className="p-6 w-full">
      <div>Add New Address</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* <CommonTextInput
          formConfig={formConfig}
          placeholder="Address Line 1"
          fieldName={"address_one"}
          rules={profileValidations?.["address_one"]}
          // label=""6
        />
        <CommonTextInput
          formConfig={formConfig}
          placeholder="Address Line 2"
          fieldName={"address_two"}
          rules={profileValidations?.["address_two"]}
          // label=""
        />
        <CommonTextInput
          formConfig={formConfig}
          placeholder="Address Line 3"
          fieldName={"address_three"}
          rules={profileValidations?.["address_three"]}
          // label=""
        />
        <div className="mt-2">
          <LocationField
            fieldName="city"
            formConfig={formConfig}
            placeholder="Enter City"
            // label="City *"
            // rules={BillingDetailsValidations["city"]}
            options={{
              types: ["(cities)"],
              componentRestrictions: { country: ["se"] },
            }}
          />
        </div>
        <CommonTextInput
          formConfig={formConfig}
          placeholder="Zipcode"
          fieldName={"zipcode"}
        /> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CommonTextInput
            formConfig={formConfig}
            placeholder="Enter Name"
            fieldName={"name"}
            rules={BillingDetailsValidations?.["name"]}
            label="Name *"
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
            label="Email *"
          />
          {/* adding updated field */}
          {/* commented for future use  */}
          {/* <CommonTextInput
            formConfig={formConfig}
            placeholder={T["enter_company_name"]}
            fieldName="company_name"
            rules={BillingDetailsValidations?.["company_name"]}
            label={`${T["company_name"]} *`}
          />

          <CommonTextInput
            formConfig={formConfig}
            placeholder={T["enter_organization_number"]}
            fieldName="organization_number"
            rules={BillingDetailsValidations?.["organization_number"]}
            isNumberOnly={true}
            label={`${T["organization_number"]} *`}
          />

          <CommonTextInput
            formConfig={formConfig}
            placeholder={T["enter_vat_id"]}
            fieldName="vat_id"
            rules={BillingDetailsValidations?.["vat_id"]}
            label={`${T["vat_id"]} *`}
          /> */}

          {/* adding updated field */}

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
            label="Address *"
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
            label="Zipcode *"
            isNumberOnly={true}
            maxLength={6}
          />
        </div>
        <button
          className="bg-[#FF6D2F] text-white py-2 px-4 rounded-md mt-4"
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
  ) : (
    <>
      <div className="p-6">
        <div className="flex flex-wrap gap-6">
          {addresses.length > 0 ? (
            addresses?.map((card, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded-lg p-4 shadow-md flex gap-4 w-2/5 bg-white"
              >
                <div className="bg-gray-300 p-2 w-min h-min">
                  <Location />
                </div>
                <div className="flex flex-col justify-between w-4/5 gap-4">
                  <div className="text-black text-sm">{`${card.address}, ${card.city}, ${card.state}`}</div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <div
                        className="text-green-600 text-sm cursor-pointer"
                        onClick={() => handleEdit(card.id)}
                      >
                        EDIT
                      </div>
                      <div
                        className="text-gray-400 text-sm cursor-pointer"
                        onClick={() => handleDelete(card.id)}
                      >
                        DELETE
                      </div>
                    </div>
                    {/* {card?.primary && <div>Primary</div>} */}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>No Saved Addresses</div>
          )}
        </div>
        <button
          className="mt-6 px-6 py-2 text-sm text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none"
          onClick={() => setShowAddressForm(true)}
        >
          Add Address
        </button>
      </div>

      {showConfirmationModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p>Are you sure you want to delete this address?</p>
            <div className="flex gap-4 mt-4">
              <button
                className="px-4 py-2 bg-[#FF6D2F] text-white rounded-md"
                onClick={confirmDelete}
              >
                Confirm
              </button>
              <button
                className="px-4 py-2 bg-gray-300 rounded-md"
                onClick={() => setShowConfirmationModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileAddress;
