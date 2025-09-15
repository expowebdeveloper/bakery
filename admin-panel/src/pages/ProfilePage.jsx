import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import dummyUserImage from "../assets/images/dummy_user.png";
import CommonTextField from "../Form Fields/CommonTextField";
import { T } from "../utils/languageTranslator";
import {
  createPreview,
  createRequiredValidation,
  prefillFormValues,
} from "../utils/helpers";
import { EmployeeValidations } from "../Validations/validations";
import LocationField from "../Form Fields/LocationField";
import CommonButton from "../Components/Common/CommonButton";
import { INSTANCE, makeApiRequest, METHODS } from "../api/apiFunctions";
import { ADMIN_INVOICE_ENDPOINT, PROFILE_ENDPOINT } from "../api/endpoints";
import PageLoader from "../loaders/PageLoader";
import { successType, toastMessage } from "../utils/toastMessage";
import { DEFAULT_ERROR_MESSAGE } from "../constant";
import { useProfile } from "../contexts/ProfileProvider";

const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const maxSizeInBytes = 10 * 1024 * 1024; // 10MB

const isValidType = (file) => allowedTypes.includes(file.type);
const isValidSize = (file) => file.size <= maxSizeInBytes;

const ProfilePage = () => {
  const userRole = localStorage.getItem("role");
  const { updateProfile } = useProfile();

  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState({ file: null, error: "" });
  const [profileData, updateProfileData] = useState({});
  const formConfig = useForm({
    mode: "onInput",
  });
  const { handleSubmit, register, setValue } = formConfig;
  const [pageLoader, setPageLoader] = useState(false);
  const [buttonLoader, setButtonLoader] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState({ file: null, error: "" });

  useEffect(() => {
    setPageLoader(true);

    // Fetch profile data
    const fetchProfile = makeApiRequest({
      method: METHODS.get,
      endPoint: PROFILE_ENDPOINT,
    });

    // Fetch admin invoice data (only for admin users)
    const fetchAdminInvoice = userRole === "admin"
      ? makeApiRequest({
        method: METHODS.get,
        endPoint: ADMIN_INVOICE_ENDPOINT,
      })
      : Promise.resolve(null); // resolves instantly if not admin

    // Run both API calls in parallel
    Promise.all([fetchProfile, fetchAdminInvoice])
      .then(([profileRes, adminInvoiceRes]) => {
        const profile = profileRes?.data;
        updateProfileData(profile);

        // Prefill basic profile fields
        const keys = [
          "first_name",
          "last_name",
          "contact_no",
          "address",
          "email",
        ];
        prefillFormValues(profile, keys, setValue);

        if (profile?.profile_picture) {
          setFile({ file: null, error: "" });
          setPreview(createPreview(profile?.profile_picture));
        }

        // Prefill admin invoice fields if admin
        if (userRole === "admin" && adminInvoiceRes?.data) {
          const adminData = adminInvoiceRes?.data;
          const adminKeys = [
            "organization_no",
            "vat_id",
            "company_address",
            "account_no",
            "iban_number",
            "bank_name",
          ];
          prefillFormValues(adminData, adminKeys, setValue);
          if(adminData?.logo){
            setLogoFile({ file: null, error: "" });
            setLogoPreview(adminData?.logo);
          }
        }
      })
      .catch((err) => console.error("Error fetching data:", err))
      .finally(() => {
        setPageLoader(false);
      });
  }, [userRole]);

  const handleImageUpload = (e, type = "profile") => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      if (!isValidType(uploadedFile)) {
        if (type === "profile") {
          setFile({
            file: null,
            error:
              "Invalid file type. Please upload a JPEG, PNG, GIF, or WEBP image.",
          });
          setPreview(null);
        } else {
          setLogoPreview({
            file: null,
            error:
              "Invalid file type. Please upload a JPEG, PNG, GIF, or WEBP image.",
          });
          setLogoPreview(null);
        }
        return;
      }
      if (!isValidSize(uploadedFile)) {
        if (type === "profile") {
          setFile({
            file: null,
            error:
              "The uploaded image is too large. Please upload an image smaller than 10 MB.",
          });
          setPreview(null);
        } else {
          setLogoFile({
            file: null,
            error:
              "The uploaded image is too large. Please upload an image smaller than 10 MB.",
          });
          setLogoPreview(null);
        }
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === "profile") {
          setFile({ file: uploadedFile, error: "" });
          setPreview(e.target.result);
        } else {
          setLogoFile({ file: uploadedFile, error: "" });
          setLogoPreview(e.target.result);
        }

      };
      reader.readAsDataURL(uploadedFile);
    }
    e.target.value = "";
  };

  const onSubmit = async (data) => {
    // Prepare profile payload
    const payload = {
      first_name: data?.first_name,
      last_name: data?.last_name,
      contact_no: data?.contact_no,
      address:
        typeof data?.address === "object" && data?.address?.formatted_address
          ? data.address.formatted_address
          : data?.address || "",
    };

    const formData = new FormData();
    for (let key in payload) {
      if (payload?.[key]) {
        formData.append(key, payload[key]);
      }
    }
    formData.append("profile_picture", file?.file || "");

    // Prepare admin invoice payload
    let adminInvoiceFormData = null;
    if (userRole === "admin") {
      adminInvoiceFormData = new FormData();
      adminInvoiceFormData.append("organization_no", data?.organization_no || "");
      adminInvoiceFormData.append("vat_id", data?.vat_id || "");
      adminInvoiceFormData.append(
        "company_address",
        typeof data?.company_address === "object" &&
          data?.company_address?.formatted_address
          ? data.company_address.formatted_address
          : data?.company_address || ""
      );
      adminInvoiceFormData.append("account_no", data?.account_no || "");
      adminInvoiceFormData.append("iban_number", data?.iban_number || "");
      adminInvoiceFormData.append("logo", logoFile?.file || "");
      adminInvoiceFormData.append("bank_name", data?.bank_name || "");
    }

    try {
      setButtonLoader(true);

      // Call Profile API (always)
      const profileResponse = await makeApiRequest({
        endPoint: PROFILE_ENDPOINT,
        method: METHODS.patch,
        instanceType: INSTANCE?.formInstance,
        isProfileUpdate: true,
        payload: formData,
      });

      updateProfile(profileResponse?.data?.data);
    
      // Call Admin Invoice API (only if admin)
      if (userRole === "admin" && adminInvoiceFormData) {
        const adminResponse = await makeApiRequest({
          endPoint: ADMIN_INVOICE_ENDPOINT,
          method: METHODS.post,
          instanceType: INSTANCE?.formInstance,
          isProfileUpdate: true,
          payload: adminInvoiceFormData,
        });

        toastMessage(
          adminResponse?.data?.message || T["profile_updated_successfully"],
          successType
        );
      }
    } catch (err) {
      console.error("Error updating profile/admin invoice:", err);
      toastMessage(
        err?.response?.data?.message || DEFAULT_ERROR_MESSAGE,
      );
    } finally {
      setButtonLoader(false);
      setFile({ file: null, error: "" });
    }
  };
  console.log(file, "this is file");

  return (
    <>
      {pageLoader ? (
        <PageLoader />
      ) : (
        <div className="mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Edit Profile
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex justify-center gap-8 mb-8">
              {/* Profile Picture Upload */}
              <div className="text-center">
                <div className="relative inline-flex flex-col items-center">
                  <label htmlFor="profilePicture" className="cursor-pointer">
                    <img
                      src={preview || dummyUserImage}
                      alt="Profile"
                      className="w-40 h-40 rounded-lg object-cover border"
                    />
                    <div className="absolute -bottom-3 -right-3 bg-white p-1 rounded-full shadow-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-8 h-8 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 20h14M12 14V4m0 0l-4 4m4-4l4 4"
                        />
                      </svg>
                    </div>
                  </label>
                  <input
                    type="file"
                    id="profilePicture"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {file.error && <p className="text-red-600 error-text mt-2">{file.error}</p>}
                </div>
                <p className="text-sm mt-2 text-gray-600">Profile Picture</p>
              </div>

              {/* Logo Upload */}
              <div className="text-center">
                <div className="relative inline-flex flex-col items-center">
                  <label htmlFor="logoUpload" className="cursor-pointer">
                    <img
                      src={logoPreview || dummyUserImage}
                      alt="Logo"
                      className="w-40 h-40 rounded-lg object-cover border"
                    />
                    <div className="absolute -bottom-3 -right-3 bg-white p-1 rounded-full shadow-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-8 h-8 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 20h14M12 14V4m0 0l-4 4m4-4l4 4"
                        />
                      </svg>
                    </div>
                  </label>
                  <input
                    type="file"
                    id="logoUpload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "logo")}
                  />
                  {logoFile?.error && <p className="text-red-600 error-text mt-2">{logoFile.error}</p>}
                </div>
                <p className="text-sm mt-2 text-gray-600">Company Logo</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CommonTextField
                label={`${T["first_name"]} *`}
                fieldName="first_name"
                rules={createRequiredValidation(T["first_name_required_message"])}
                className="w-full p-2 border rounded mt-1"
                formConfig={formConfig}
                placeholder={T["enter_first_name"]}
              />
              <CommonTextField
                label={`${T["last_name"]} *`}
                fieldName="last_name"
                rules={createRequiredValidation(T["last_name_required_message"])}
                className="w-full p-2 border rounded mt-1"
                formConfig={formConfig}
                placeholder={T["enter_last_name"]}
              />
              <CommonTextField
                label={`${T["email"]} *`}
                fieldName="email"
                isRequired={true}
                className="w-full p-2 border rounded mt-1"
                rules={createRequiredValidation(T["email"])}
                formConfig={formConfig}
                placeholder={T["enter_email"]}
                disabled={profileData?.email}
              />
              <CommonTextField
                label={`${T["phone_number"]} *`}
                fieldName="contact_no"
                placeholder={T["eg"]}
                rules={EmployeeValidations["contact_no"]}
                formConfig={formConfig}
                isNumberOnly={true}
                isDecimal={false}
                className="w-full p-2 border rounded mt-1"
              />
            </div>
            <LocationField
              fieldName="address"
              formConfig={formConfig}
              className="w-full p-2 border rounded mt-1"
              placeholder={T["enter_address"]}
              label={`${T["address"]} *`}
              rules={EmployeeValidations["address"]}
              options={{
                types: ["address"],
                componentRestrictions: { country: ["se"] },
              }}
            />
            {/* fields for admin related to invoice */}
            {
              userRole === "admin" ?
                <>
                  <CommonTextField
                    formConfig={formConfig}
                    placeholder={T["enter_organization_number"]}
                    fieldName="organization_no"
                    rules={createRequiredValidation(T["organization_number"])}
                    isNumberOnly={true}
                    className="w-full p-2 border rounded mt-1"
                    label={`${T["organization_number"]} *`}
                  />
                  <CommonTextField
                    formConfig={formConfig}
                    placeholder={T["enter_vat_id"]}
                    fieldName="vat_id"
                    rules={createRequiredValidation(T["vat_id"])}
                    label={`${T["vat_id"]} *`}
                    className="w-full p-2 border rounded mt-1"
                  />
                  <LocationField
                    fieldName="company_address"
                    formConfig={formConfig}
                    className="w-full p-2 border rounded mt-1"
                    placeholder={T["enter_complete_address"]}
                    label={`${T["complete_address"]} *`}
                    rules={createRequiredValidation(T["complete_address"])}
                    options={{
                      types: ["address"],
                      componentRestrictions: { country: ["se"] },
                    }}
                  />
                    <CommonTextField
                    formConfig={formConfig}
                    placeholder={T["enter_bank_name"]}
                    fieldName="bank_name"
                    rules={createRequiredValidation(T["bank_name"])}
                    className="w-full p-2 border rounded mt-1"
                    label={`${T["bank_name"]} *`}
                  />
                  <CommonTextField
                    formConfig={formConfig}
                    placeholder={T["enter_bank_giro"]}
                    fieldName="account_no"
                    rules={createRequiredValidation(T["bank_giro"])}
                    isNumberOnly={true}
                    className="w-full p-2 border rounded mt-1"
                    label={`${T["bank_giro"]} *`}
                  />
                  <CommonTextField
                    formConfig={formConfig}
                    placeholder={T["enter_iban"]}
                    fieldName="iban_number"
                    rules={{
                      required: T["iban_number_required"],
                      pattern: {
                        value: /^SE\d{2}[A-Za-z0-9]{20}$/,
                        message: T["invalid_iban"],
                      },
                    }}
                    className="w-full p-2 border rounded mt-1"
                    label={`${T["iban"]} *`}
                  />
                </>
                : ""
            }
            {/* fields for admin related to invoice */}

            <div className="text-center">
              <CommonButton
                type="submit"
                className="orange_btn !mx-auto"
                text={T["update_profile"]}
                disabled={buttonLoader}
                loader={buttonLoader}
              />
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ProfilePage;
