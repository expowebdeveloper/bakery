"use client";
import React, { useState, useEffect } from "react";
import Location from "../../public/icons/location";
import CommonTextInput from "@/_form-fields/CommonTextInput";
import { profileValidations } from "@/_validations/authValidations";
import { useForm } from "react-hook-form";
import CommonButton from "./_common/CommonButton";
import { PROFILE_UPDATE, UPDATE_PASSWORD } from "@/_Api Handlers/endpoints";
import { callApi } from "@/_Api Handlers/apiFunctions";
import { INSTANCE } from "@/_Api Handlers/apiConfig";
import moment from "moment";
import Image from "next/image";
import Cookies from "js-cookie";
import { toastMessage } from "@/_utils/toastMessage";
import { createPreview } from "@/_utils/helpers";
import { T } from "@/utils/languageTranslator";
import { BillingDetailsValidations } from "@/_validations/billingDetailsValidations";
import { PRICE_UNIT } from "@/_constants/constant";

const Sidebar = ({
  isSidebarOpen,
  toggleSidebar,
  sideBarItems,
  handleChangePassword,
  profileData,
  ordersData,
  sidebarItemId,
  handleProfileData,
}) => {
  const formConfig = useForm();
  const { handleSubmit, watch, reset, register, setValue } = formConfig;
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleShowOldPassword = () => {
    setShowOldPassword((prev) => !prev);
  };

  const toggleShowNewPassword = () => {
    setShowNewPassword((prev) => !prev);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const onSubmit = (values) => {
    let updatedData;
    if (sideBarItems === "editProfile") {
      const payload = {
        user: {
          first_name: values?.first_name,
          last_name: values?.last_name,
          email: values?.email,
          contact_no: values?.phone_number,
        },
        organization_no: +values?.organization_no,
        vat_id: values?.vat_id,
        name: values?.name,
      };
      callApi({
        endPoint: PROFILE_UPDATE,
        method: "PATCH",
        instanceType: INSTANCE?.authorized,
        payload: payload,
      })
        .then((res) => {
          updatedData = res?.data?.data;
          toastMessage("Profile updated successfully", "success");
          Cookies.set("firstName", values?.first_name);
          Cookies.set("lastName", values?.last_name);
        })
        .catch((error) => {
          console.error("Error getting address:", error);
          toastMessage("Something went wrong", "error");
        });
    } else {
      callApi({
        endPoint: UPDATE_PASSWORD,
        method: "POST",
        instanceType: INSTANCE?.authorized,
        payload: {
          old_password: values.old_password,
          new_password: values.new_password,
          confirm_password: values.confirm_password,
        },
      })
        .then((res) => {
          toastMessage("Password updated successfully", "success");
        })
        .catch((error) => {
          console.error("Error getting address:", error);
          toastMessage("Something went wrong", "error");
        });
    }
    toggleSidebar();
    reset();
    if (updatedData) {
      setValue("first_name", updatedData?.user?.first_name);
      setValue("last_name", updatedData?.user?.last_name);
      setValue("email", updatedData?.user?.email);
      setValue("phone_number", updatedData?.contact_no);
    } else {
      handleProfileData();
    }
  };

  useEffect(() => {
    console.log(profileData, "this iss profile data")
    setValue("first_name", profileData?.user?.first_name);
    setValue("last_name", profileData?.user?.last_name);
    setValue("email", profileData?.user?.email);
    setValue("phone_number", profileData?.contact_no);
    setValue("organization_no", profileData?.organization_no);
    setValue("vat_id", profileData?.vat_id);
    setValue("name", profileData?.name);

  }, [profileData]);

  const currentItem = ordersData?.filter((itm) => itm.id === sidebarItemId);

  const handleChangePasswordClick = () => {
    handleChangePassword();
    reset();
  };

  const handleClose = () => {
    toggleSidebar();
    setValue("first_name", profileData?.user?.first_name);
    setValue("last_name", profileData?.user?.last_name);
    setValue("email", profileData?.user?.email);
    setValue("phone_number", profileData?.contact_no);
  };

  return (
    <div
      className={`fixed top-0 right-0 w-full max-w-md h-screen bg-white shadow-lg hide-scrollbar z-50 transform ${isSidebarOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 z-40`}
    >
      {sideBarItems === "orders" ? (
        <div className="p-4">
          {/* Order Header */}
          <div className="flex gap-6">
            <button
              className="text-gray-500 hover:text-gray-800"
              onClick={toggleSidebar}
            >
              ✖
            </button>
            <div className="text-lg font-bold text-black">
              Order #{currentItem?.[0]?.order_id}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex gap-4 mb-6">
              <div>
                <Location />
              </div>
              <div className="font-medium text-black">bakery</div>
            </div>
            <div className="flex gap-4">
              <div>
                <Location />
              </div>
              <div>
                <div>{`${currentItem?.[0]?.user?.first_name} ${currentItem?.[0]?.user?.last_name}`}</div>
                <div className="text-[#878787]">
                  {currentItem?.[0]?.address}
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-sm ml-10">
              {/* {`${currentItem?.[0]?.shipping_address.address},${currentItem?.[0]?.shipping_address.city}`} */}
              <br />
              {/* {currentItem?.[0]?.shipping_address.state} */}
            </p>
            <div className="ml-10">
              <p className="text-black font-medium mt-2">
                Delivered on{" "}
                {moment(currentItem?.[0]?.updated_at).format(
                  "ddd, MMM DD, YYYY, hh:mm A"
                )}
              </p>
              <span className="inline-block bg-[#E8E4FF] text-[#0003A3] text-xs font-medium px-2 py-1 rounded mt-2">
                On Time
              </span>
            </div>
          </div>

          {/* Order Details */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-black">Order Details</h3>
            <ul className="mt-4 space-y-4">
              {currentItem?.[0]?.items?.map((itm, index) => (
                <li key={index} className="flex items-center">
                  <img
                    src={createPreview(
                      itm?.product?.product?.images?.find(
                        (ele) => ele?.is_featured === true
                      ).image
                    )}
                    alt="Premium Croissant"
                    className="w-12 h-12 rounded mr-4"
                  />
                  <div className="flex-grow">
                    <p className="font-medium text-black">{itm.product.name}</p>
                    <p className="text-sm text-[#FF6363]">${itm.price}</p>
                  </div>
                  <p className="font-medium text-black">
                    ${Number(itm.price) * itm.quantity}.00
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Item Totals */}

          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between mb-4">
              <p className="text-black">{T["total"]}</p>
              <p className="text-black">${currentItem?.[0]?.total_amount || "0.00"}</p>
            </div>
                        {/* commented for future use */}

            {/* <div className="flex justify-between text-gray-600">
              <p>{T["packing_fee"]}</p>
              <p>{currentItem?.[0]?.packing_fee || "0.00"} {" "}{PRICE_UNIT}</p>
            </div> */}
            {/* commented for future use */}
            {/* <div className="flex justify-between text-gray-600">
              <p>{T["platform_fee"]}</p>
              <p>{currentItem?.[0]?.platform_fee || "0.00"} {" "}{PRICE_UNIT}</p>
            </div> */}
            {currentItem?.[0]?.coupon_name ? (
              <div className="flex justify-between text-green-600">
                <p>{T["discount_applied"]} ({currentItem?.[0]?.coupon_name})</p>
                <p> -{currentItem?.[0]?.discounted_amount || "0.00"}{" "}{PRICE_UNIT}</p>
              </div>
            ) : <div>
              <p>Discount Applied -{currentItem?.[0]?.discounted_amount || "0.00"}{" "}{PRICE_UNIT}</p>

            </div>}
            <div className="flex justify-between text-gray-600">
              <p>{T["delivery_fee"]}</p>
              <p>{currentItem?.[0]?.shipping_fee}{" "}{PRICE_UNIT}</p>
            </div>
            <div className="flex justify-between text-gray-600">
              <p>{T["vat"]}</p>
              <p>{currentItem?.[0]?.vat_amount}{" "}{PRICE_UNIT}</p>
            </div>
          </div>

          {/* Total Bill */}
          <div className="mt-6 border-t border-black pt-4 flex justify-between">
            {/* <div className="text-black">Paid via Card</div> */}
            <div className="text-black font-bold">Total</div>
            <div className="text-black font-bold">
              {currentItem?.[0]?.final_amount}{" "}{PRICE_UNIT}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-4">
            <div className="flex justify-between">
              <button
                className="text-gray-500 hover:text-gray-800"
                onClick={handleClose}
                type="button"
              >
                ✖
              </button>
              <div className="text-lg font-bold text-black">{T["edit_profile"]}</div>
            </div>
            <div className="mt-4 space-y-6">
              {sideBarItems === "editProfile" ? (
                <div>
                  <CommonTextInput
                    formConfig={formConfig}
                    placeholder="Enter First Name"
                    fieldName={"first_name"}
                    rules={profileValidations?.["first_name"]}
                    label="First Name *"
                  />
                  <CommonTextInput
                    formConfig={formConfig}
                    placeholder="Enter Last Name"
                    fieldName={"last_name"}
                    rules={profileValidations?.["last_name"]}
                    label="Last Name *"
                  />
                  <CommonTextInput
                    formConfig={formConfig}
                    placeholder="Enter Email"
                    fieldName={"email"}
                    rules={profileValidations?.["email"]}
                    label="Email *"
                  />
                  <CommonTextInput
                    formConfig={formConfig}
                    placeholder="Enter Contact Number"
                    fieldName={"phone_number"}
                    rules={profileValidations?.["phone_number"]}
                    label="Contact Number *"
                    isNumberOnly={true}
                    maxLength={10}
                  />
                  {/* adding extra fields */}
                  <div className="mt-2">
                    <CommonTextInput
                      formConfig={formConfig}
                      placeholder={T["enter_company_name"]}
                      fieldName="name"
                      rules={BillingDetailsValidations?.["company_name"]}
                      label={`${T["company_name"]} *`}
                    />
                  </div>
                  <div className="mt-2">
                    <CommonTextInput
                      formConfig={formConfig}
                      placeholder={T["enter_organization_number"]}
                      fieldName="organization_no"
                      rules={BillingDetailsValidations?.["organization_number"]}
                      isNumberOnly={true}
                      label={`${T["organization_number"]} *`}
                    />
                  </div>
                  <div className="mt-2">
                    <CommonTextInput
                      formConfig={formConfig}
                      placeholder={T["enter_vat_id"]}
                      fieldName="vat_id"
                      rules={BillingDetailsValidations?.["vat_id"]}
                      label={`${T["vat_id"]} *`}
                    />
                  </div>
                  {/* adding extra fields */}

                  <div
                    className="text-[#01A933] underline cursor-pointer mt-6"
                    onClick={handleChangePasswordClick}
                  >
                    {T["change_password"]}
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-6">
                  <CommonTextInput
                    formConfig={formConfig}
                    placeholder="Enter Old Password"
                    fieldName={"old_password"}
                    rules={profileValidations?.["old_password"]}
                    label="Enter Old Password *"
                    type={showOldPassword ? "text" : "password"}
                    onIconClick={toggleShowOldPassword}
                    icon={
                      <Image
                        src={
                          showOldPassword
                            ? "/icons/closedEye.svg"
                            : "/icons/openEye.svg"
                        }
                        alt="Toggle Password Visibility Icon"
                        width={24}
                        height={24}
                      />
                    }
                  />
                  <CommonTextInput
                    formConfig={formConfig}
                    placeholder="Enter New Password"
                    fieldName={"new_password"}
                    rules={profileValidations?.["new_password"]}
                    label="Enter New Password *"
                    type={showNewPassword ? "text" : "password"}
                    onIconClick={toggleShowNewPassword}
                    icon={
                      <Image
                        src={
                          showNewPassword
                            ? "/icons/closedEye.svg"
                            : "/icons/openEye.svg"
                        }
                        alt="Toggle Password Visibility Icon"
                        width={24}
                        height={24}
                      />
                    }
                  />
                  <CommonTextInput
                    formConfig={formConfig}
                    placeholder="Confirm New Password"
                    fieldName={"confirm_password"}
                    rules={profileValidations?.["confirm_password"]}
                    label="Confirm New Password *"
                    type={showConfirmPassword ? "text" : "password"}
                    onIconClick={toggleShowConfirmPassword}
                    icon={
                      <Image
                        src={
                          showConfirmPassword
                            ? "/icons/closedEye.svg"
                            : "/icons/openEye.svg"
                        }
                        alt="Toggle Password Visibility Icon"
                        width={24}
                        height={24}
                      />
                    }
                  />
                </div>
              )}
              <div className="flex justify-center mt-20">
                <button
                  className="bg-[#FF6D2F] text-white py-2 px-4 rounded-md"
                  type="submit"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default Sidebar;
