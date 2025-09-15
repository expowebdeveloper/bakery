import React, { useEffect } from "react";
import AddEditSectionHeading from "./AddEditSectionHeading";
import FormWrapper from "../Wrappers/FormWrapper";
import CommonTextField from "../Form Fields/CommonTextField";
import CommonSelect from "../Form Fields/CommonSelect";
import CommonDateField from "../Form Fields/CommonDateField";
import { RawMaterialValidations } from "../Validations/validations";
import { MEASURE_OPTIONS, today, YYYY_MM_DD } from "../constant";
import { createName, formatDate, prefillFormValues } from "../utils/helpers";
import { T } from "../utils/languageTranslator";

const ViewCustomer = ({ item, onClose, formConfig }) => {
    console.log(item,
        "customer item"
    )
    const { setValue, watch } = formConfig;
    useEffect(() => {
        setValue("company_name", item?.name);
        setValue("address", item?.addresses?.length ? item?.addresses[0]?.address : "");
        setValue("organization_no", item?.organization_no)
        setValue("customer_name", createName(item?.user?.first_name, item?.user?.last_name));
        setValue("vat_id", item?.vat_id);
        setValue("vat_id", item?.vat_id);
        setValue("contact_no", item?.contact_no);
        setValue("email", item?.user?.email);
    }, []);
    return (
        <div>
            {" "}
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                <div className="category-section overflow-auto">
                    <AddEditSectionHeading onClose={onClose} text={T["customer_details"]} />
                    {/* <CommonButton text="fill form" type="button" onClick={fillForm} /> */}
                    <form>
                        <CommonTextField
                            label={T["company_name"]}
                            fieldName="company_name"
                            // rules={RawMaterialValidations["name"]}
                            formConfig={formConfig}
                            disabled={true}
                        />
                        {
                            watch("address") ?
                                <CommonTextField
                                    label={T["address"]}
                                    fieldName="address"
                                    // rules={RawMaterialValidations["name"]}
                                    formConfig={formConfig}
                                    disabled={true}
                                />
                                : ""
                        }

                        {
                            watch("organization_no") ?
                                <CommonTextField
                                    label={T["organization_number"]}
                                    fieldName="organization_no"
                                    // rules={RawMaterialValidations["name"]}
                                    formConfig={formConfig}
                                    disabled={true}
                                />
                                : ""
                        }
                        {
                            watch("vat_id") ?
                                <CommonTextField
                                    label={T["vat_id"]}
                                    fieldName="vat_id"
                                    formConfig={formConfig}
                                    disabled={true}
                                />
                                : ""
                        }

                        {
                            watch("customer_name") ?
                                <CommonTextField
                                    label={T["customer_name"]}
                                    fieldName="customer_name"
                                    // rules={RawMaterialValidations["name"]}
                                    formConfig={formConfig}
                                    disabled={true}
                                />
                                : ""
                        }
                        <CommonTextField
                            label={T["contact_number"]}
                            fieldName="contact_no"
                            // rules={RawMaterialValidations["name"]}
                            formConfig={formConfig}
                            disabled={true}
                        />
                        <CommonTextField
                            label={T["email"]}
                            fieldName="email"
                            // rules={RawMaterialValidations["name"]}
                            formConfig={formConfig}
                            disabled={true}
                        />




                    </form>
                </div>
            </div>
        </div>
    );
};

export default ViewCustomer;
