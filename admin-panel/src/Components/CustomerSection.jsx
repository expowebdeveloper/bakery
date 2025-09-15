import React, { useEffect, useState } from "react";
import FormWrapper from "../Wrappers/FormWrapper";
import { draftIcon, publishIcon } from "../assets/Icons/Svg";
import AddEditSectionHeading from "./AddEditSectionHeading";
import CommonTextField from "../Form Fields/CommonTextField";
import { CategoryValidations, EmployeeValidations } from "../Validations/validations";
import CommonSelect from "../Form Fields/CommonSelect";
import ImageUploadSection from "../Form Fields/ImageUploadSection";
import { allowedImageTypes, PNG, PNG_AND_JPG, PNG_TYPE } from "../constant";
import {
    convertIntoSelectOptions,
    createPreview,
    createRequiredValidation,
    extractOption,
    generateSlug,
    prefillFormValues,
} from "../utils/helpers";
import CommonButton from "./Common/CommonButton";
import { T } from "../utils/languageTranslator";
import { EMAIL_REGEX } from "../regex/regex";
const CustomerSection = ({
    onClose,
    formConfig,
    onSubmit,
    customerSectionInfo,
    btnLoaders
}) => {
    const { setValue, watch } = formConfig;
    const { isEdit, item } = customerSectionInfo
    useEffect(() => {
        if (isEdit) {
            // prefillFormValues(item, keysToPrefill, setValue);
        }
    }, []);


    const renderHeading = () => {
        return (isEdit) ? T["edit_customer"] : T["add_customer"]
    };
    return (
        // update required: Update this from modal to section according to the figma
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="category-section overflow-auto">
                <AddEditSectionHeading onClose={onClose} text={renderHeading()} />
                {/* here custom logic is required that's why not using form wrapper */}

                <FormWrapper
                    onSubmit={onSubmit}
                    formConfig={formConfig}
                    className="orange_btn"
                    // wrapperClass="scroll"
                    isCustomButtons={true}
                >
                    <CommonTextField
                        label={`${T["first_name"]} *`}
                        fieldName="first_name"
                        formConfig={formConfig}
                        className="add-edit-input"
                        rules={createRequiredValidation(T["first_name"])}
                        placeholder={T["enter_first_name"]}
                    />

                    <CommonTextField
                        label={`${T["last_name"]} *`}
                        fieldName="last_name"
                        formConfig={formConfig}
                        className="add-edit-input"
                        rules={createRequiredValidation(T["last_name"])}
                        placeholder={T["enter_last_name"]}
                    />

                    <CommonTextField
                        label={`${T["email"]} *`}
                        fieldName="email"
                        formConfig={formConfig}
                        className="add-edit-input"
                        rules={{
                            ...createRequiredValidation(T["email"]),
                            pattern: {
                                value: EMAIL_REGEX,
                                message: T["please_enter_valid_email"],
                            },
                        }}
                        placeholder={T["enter_email"]}
                    />
                    <CommonTextField
                        label={`${T["phone_number"]} *`}
                        fieldName="contact_no"
                        placeholder={T["eg"]}
                        rules={{
                         ...createRequiredValidation(T["contact_no"]),
                         pattern:{
                            value: /^(?:46|0)[\d\s-]{7,13}$/,
                            message: T["please_enter_valid_swedish_phone_number"]
                         }
                        }}
                        maxLength={13}
                        formConfig={formConfig}
                        isNumberOnly={true}
                        isDecimal={false}
                    />


                    <CommonTextField
                        label={`${T["company_name"]} *`}
                        fieldName="company_name"
                        formConfig={formConfig}
                        className="add-edit-input"
                        rules={createRequiredValidation(T["company_name"])}
                        placeholder={T["enter_company_name"]}
                    />


                    <CommonTextField
                        label={`${T["organization_number"]} *`}
                        fieldName="organization_no"
                        formConfig={formConfig}
                        className="add-edit-input"
                        rules={createRequiredValidation(T["organization_number"])}
                        placeholder={T["enter_organization_number"]}
                        isNumberOnly={true}
                    />


                    <CommonTextField
                        label={`${T["vat_id"]} *`}
                        fieldName="vat_id"
                        formConfig={formConfig}
                        className="add-edit-input"
                        rules={createRequiredValidation(T["vat_id"])}
                        placeholder={T["enter_vat_id"]}
                    />


                    {/* update this field according to the API */}

                    <div className="button-section">
                        <CommonButton
                            type="submit"
                            text={T["add_customer"]}
                            // icon={publishIcon}
                            className="orange_btn"
                            name="addCustomer"
                            loader={btnLoaders?.addCustomer}
                            disabled={btnLoaders?.addCustomer || btnLoaders?.generateLink}
                        />
                        {/* need to confirm functionality for this */}
                        <CommonButton
                            type="submit"
                            text={T["generate_signup_link"]}
                            // icon={draftIcon}
                            className="grey_btn"
                            name="generateLink"
                            loader={btnLoaders?.generateLink}
                            disabled={btnLoaders?.addCustomer || btnLoaders?.generateLink}
                        />
                    </div>
                    {/* </form> */}
                </FormWrapper>
            </div>
        </div>
    );
};

export default CustomerSection;
