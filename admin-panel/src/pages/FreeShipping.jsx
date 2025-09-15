import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FormWrapper from "../Wrappers/FormWrapper";
import DiscountCodeSection from "../Components/Common/DiscountCodeSection";
import MinimumPurchaseRequirement from "../Components/Common/MinimumPurchaseRequirement";
import CustomerEligibility from "../Components/Common/CustomerEligibility";
import DiscountUses from "../Components/Common/DiscountUses";
import Combinations from "../Components/Common/Combinations";
import ActiveDates from "../Components/Common/ActiveDates";
import DiscountSideSection from "../Components/DiscountSideSection";
import SummarySection from "../Components/Common/SummarySection";
import { makeApiRequest, METHODS } from "../api/apiFunctions";
import { DISCOUNT_ENDPOINT } from "../api/endpoints";
import { successType, toastMessage } from "../utils/toastMessage";
import {
  CUSTOMER_SPECIFIC_OPTIONS,
  DEFAULT_ERROR_MESSAGE,
  INVALID_ID,
  SWEDEN_COUNTY_OPTIONS,
} from "../constant";
import { useNavigate } from "react-router-dom";
import {
  extractOption,
  extractStateOption,
  prefillFormValues,
} from "../utils/helpers";
import Countries from "../Components/Countries";
import useLoader from "../hooks/useLoader";
import PageLoader from "../loaders/PageLoader";

const FreeShipping = ({ location }) => {
  const navigate = useNavigate();
  const formConfig = useForm();
  const { setValue, watch } = formConfig;
  const { pageLoader, toggleLoader } = useLoader();

  const [btnLoaders, setBtnLoaders] = useState({
    draft: false,
    saveDiscount: false,
  });

  const isEdit = location?.state?.isEdit;

  const editId = location?.state?.editId;
  useEffect(() => {
    // const dummyData = {
    //   code: "DIUSU",
    //   combination: ["product_discounts", "order_discounts"],
    //   exclude_shipping_rate: true,
    //   start_date: "2024-12-14",
    //   end_date: "2024-12-14",
    //   start_time: "03:33",
    //   end_time: "03:33",
    //   customer_eligibility: "specific_customer",
    //   minimum_item_value: 123,
    //   minimum_purchase_requirement: "minimum_purchase",
    //   shipping_rate: 12,
    //   customer_specification: "recent_purchased",
    //   shipping_scope: "specific_states",
    //   states: ["Stockholm", "Västernorrland"],
    //   maximum_usage_value: 213,
    //   maximum_discount_usage: "limit_discount_usage_time",
    //   coupon_type: "free_shipping",
    // };

    if (isEdit) {
      toggleLoader("pageLoader");
      makeApiRequest({
        endPoint: `${DISCOUNT_ENDPOINT}${editId}`,
        method: METHODS.get,
      })
        .then((res) => {
          const data = res?.data;
          const directKeys = [
            "code",
            "combination",
            "start_date",
            "end_date",
            "end_time",
            "start_time",
            "maximum_usage_value",
            "maximum_discount_usage",
            "customer_eligibility",
            "shipping_scope",
            "exclude_shipping_rate",
            "shipping_rate",
            "minimum_purchase_requirement",
            "minimum_purchase_value",
            "minimum_item_value",
          ];
          prefillFormValues(data, directKeys, setValue);
          const specificCustomerOption = extractOption(
            CUSTOMER_SPECIFIC_OPTIONS,
            data?.customer_specification,
            "value"
          );
          setValue("customer_specification", specificCustomerOption);
          const statesOptions = data?.states.map((ele) =>
            extractStateOption(SWEDEN_COUNTY_OPTIONS, ele, "value")
          );
          console.log(statesOptions, "this is extracted");
          setValue("states", statesOptions);
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
  }, []);

  const onSubmit = (values, event) => {
    const buttonType = event.nativeEvent.submitter.name;
    const payloadKeys = [
      "code",
      "combination",
      "start_date",
      "end_date",
      "start_time",
      "end_time",
      "customer_eligibility",
      "minimum_purchase_value",
      "minimum_purchase_requirement",
      "shipping_rate",
      "states",
      "customer_specification",
      "shipping_scope",
      "maximum_usage_value",
      "maximum_discount_usage",
      "minimum_item_value",
    ];
    let payload = { exclude_shipping_rate: values?.exclude_shipping_rate };
    payloadKeys.forEach((key) => {
      if (values?.[key]) {
        if (
          key === "minimum_purchase_value" ||
          key === "shipping_rate" ||
          key === "minimum_item_value" ||
          key === "maximum_usage_value"
        ) {
          payload[key] = +values[key];
        } else if (key === "states" && values?.states?.length) {
          console.log(values?.states, "values?.states");
          const states = values?.states?.map((ele) => ele && ele.value);
          payload[key] = states.filter((el) => el);
        } else if (key === "customer_specification") {
          payload[key] = values?.[key]?.value;
        } else {
          payload[key] = values[key];
        }
      }
    });
    payload = { ...payload, coupon_type: "free_shipping" };
    setBtnLoaders({ ...btnLoaders, [buttonType]: !btnLoaders[buttonType] });
    makeApiRequest({
      endPoint: DISCOUNT_ENDPOINT,
      method: isEdit ? METHODS?.put : METHODS?.post,
      update_id: editId && editId,
      payload: payload,
    })
      .then((res) => {
        toastMessage("Discount created successfully", successType);
        navigate("/discounts");
      })
      .catch((err) => {
        console.log(err);
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
            <div className="flex flex-col gap-8 discount-main-wrapper w-[calc(100%-320px)]">
              <DiscountCodeSection formConfig={formConfig} />
              {/* add countries section here */}
              <Countries formConfig={formConfig} />
              <MinimumPurchaseRequirement formConfig={formConfig} />
              <CustomerEligibility formConfig={formConfig} />
              <DiscountUses formConfig={formConfig} />
              <Combinations formConfig={formConfig} isShipping={true} />
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

export default FreeShipping;
