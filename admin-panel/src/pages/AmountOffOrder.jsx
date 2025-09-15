import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FormWrapper from "../Wrappers/FormWrapper";
import DiscountCodeSection from "../Components/Common/DiscountCodeSection";
import DiscountTypeAndValue from "../Components/Common/DiscountTypeAndValue";
import DiscountUses from "../Components/Common/DiscountUses";
import DiscountedValue from "../Components/DiscountedValue";
import CustomerEligibility from "../Components/Common/CustomerEligibility";
import Combinations from "../Components/Common/Combinations";
import ActiveDates from "../Components/Common/ActiveDates";
import DiscountSideSection from "../Components/DiscountSideSection";
import MinimumPurchaseRequirement from "../Components/Common/MinimumPurchaseRequirement";
import SummarySection from "../Components/Common/SummarySection";
import { DISCOUNT_ENDPOINT } from "../api/endpoints";
import { makeApiRequest, METHODS } from "../api/apiFunctions";
import { successType, toastMessage } from "../utils/toastMessage";
import {
  CUSTOMER_SPECIFIC_OPTIONS,
  DEFAULT_ERROR_MESSAGE,
  DISCOUNT_TYPE_OPTIONS,
  INVALID_ID,
} from "../constant";
import { useNavigate } from "react-router-dom";
import { extractOption, prefillFormValues } from "../utils/helpers";
import useLoader from "../hooks/useLoader";
import PageLoader from "../loaders/PageLoader";

const AmountOffOrder = ({ location }) => {
  const navigate = useNavigate();
  const [btnLoaders, setBtnLoaders] = useState({
    draft: false,
    saveDiscount: false,
  });
  const { pageLoader, toggleLoader } = useLoader();
  const formConfig = useForm();
  const { watch, setValue } = formConfig;
  const isEdit = location?.state?.isEdit;
  const editId = location?.state?.editId;
  useEffect(() => {
    if (isEdit) {
      toggleLoader("pageLoader");
      makeApiRequest({
        endPoint: `${DISCOUNT_ENDPOINT}${editId}`,
        method: METHODS.get,
      })
        .then((res) => {
          const data = res?.data;
          const directKeys = ["code","discount_value","minimum_purchase_requirement","minimum_purchase_value","minimum_item_value","customer_eligibility","maximum_discount_usage","maximum_usage_value","combination","end_date", "end_time","start_date", "start_time"];
          prefillFormValues(data, directKeys, setValue);
          const discountTypeOption = extractOption(
            DISCOUNT_TYPE_OPTIONS,
            data?.discount_types,
            "value"
          );
          setValue("discount_types", discountTypeOption);
          const customerSpecificOption = extractOption(
            CUSTOMER_SPECIFIC_OPTIONS,
            data?.customer_specification,
            "value"
          );
          setValue("customer_specification", customerSpecificOption);
        })
        .catch((err) => {
          console.log(err);
          toastMessage(err?.response?.data?.name?.[0] || INVALID_ID);
          navigate("/discounts");
        })
        .finally(() => {
          toggleLoader("pageLoader");
        });
    }
  }, [location, isEdit]);

  const onSubmit = (values, event) => {
    const buttonType = event.nativeEvent.submitter.name;
    setBtnLoaders({ ...btnLoaders, [buttonType]: !btnLoaders[buttonType] });

    const fields = [
      "code",
      "discount_types",
      "discount_value",
      "minimum_purchase_requirement",
      "minimum_purchase_value",
      "customer_eligibility",
      "customer_specification",
      "maximum_discount_usage",
      "minimum_item_value",
      "combination",
      "end_date",
      "end_time",
      "start_date",
      "start_time",
      "maximum_usage_value",
    ];
    const payload = {
      coupon_type: "amount_off_order",
    };
    fields.forEach((key) => {
      if (values?.[key]) {
        if (key === "customer_specification" || key === "discount_types") {
          payload[key] = values?.[key]?.value;
        } else if (
          key === "discount_value" ||
          key === "minimum_item_value" ||
          key === "maximum_usage_value" ||
          key === "minimum_purchase_value"
        ) {
          payload[key] = +values?.[key];
        } else {
          payload[key] = values?.[key];
        }
      }
    });
    makeApiRequest({
      endPoint: DISCOUNT_ENDPOINT,
      method: isEdit ? METHODS?.put : METHODS.post,
      payload: payload,
      update_id: editId && editId,
    })
      .then((res) => {
        toastMessage(
          `Discount ${isEdit ? "Created" : "Updated"} successfully`,
          successType
        );
        navigate("/discounts");
      })
      .catch((err) => {
        console.log(err?.response?.data, "this is coupon errir");
        const fieldError =
          err?.response?.data?.name?.[0] || err?.response?.data?.code?.[0];
        toastMessage(fieldError || DEFAULT_ERROR_MESSAGE);
      })
      .finally(() => {
        setBtnLoaders({ ...btnLoaders, [buttonType]: false });
      });
  };
  return (
    <div>
      {pageLoader ? (
        <PageLoader />
      ) : (
        <FormWrapper
          formConfig={formConfig}
          onSubmit={onSubmit}
          isCustomButtons={true}
        >
          <div className="flex gap-6 discount-wrapper">
            <div className="flex discount-main-wrapper flex-col gap-8 w-[calc(100%-320px)]">
              <DiscountCodeSection formConfig={formConfig} />
              <DiscountTypeAndValue formConfig={formConfig} />
              <MinimumPurchaseRequirement formConfig={formConfig} />
              <CustomerEligibility formConfig={formConfig} />
              <DiscountUses formConfig={formConfig} />
              <Combinations formConfig={formConfig} />
              <ActiveDates formConfig={formConfig} />
            </div>
            {/* sidebar */}
            <DiscountSideSection btnLoaders={btnLoaders}>
              <SummarySection formConfig={formConfig} />
            </DiscountSideSection>
          </div>
        </FormWrapper>
      )}
    </div>
  );
};

export default AmountOffOrder;
