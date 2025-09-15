import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FormWrapper from "../Wrappers/FormWrapper";
import DiscountSideSection from "../Components/DiscountSideSection";
import CustomerEligibility from "../Components/Common/CustomerEligibility";
import Combinations from "../Components/Common/Combinations";
import ActiveDates from "../Components/Common/ActiveDates";
import DiscountUses from "../Components/Common/DiscountUses";
import DiscountCodeSection from "../Components/Common/DiscountCodeSection";
import MinimumPurchaseRequirement from "../Components/Common/MinimumPurchaseRequirement";
import DiscountedValue from "../Components/DiscountedValue";
import SummarySection from "../Components/Common/SummarySection";
import CustomerBuys from "../Components/CustomerBuys";
import CustomerGets from "../Components/CustomerGets";
import { makeApiRequest, METHODS } from "../api/apiFunctions";
import { DISCOUNT_ENDPOINT } from "../api/endpoints";
import { successType, toastMessage } from "../utils/toastMessage";
import {
  CUSTOMER_SPECIFIC_OPTIONS,
  DEFAULT_ERROR_MESSAGE,
  INVALID_ID,
  ITEMS_FROM_OPTIONS,
} from "../constant";
import { useNavigate } from "react-router-dom";
import {
  convertPairFromProducts,
  convertProductsIntoPairs,
  extractOption,
  prefillFormValues,
} from "../utils/helpers";
import useLoader from "../hooks/useLoader";
import PageLoader from "../loaders/PageLoader";

const BuyXGetY = ({ location }) => {
  const [btnLoaders, setBtnLoaders] = useState({
    draft: false,
    saveDiscount: false,
  });
  const { pageLoader, toggleLoader } = useLoader();

  const navigate = useNavigate();
  //   const dummy = {
  //     "code": "WPE5A",
  //     "customer_buy_types": "minimum_purchase_amount",
  //     "items_from": {
  //         "label": "Specify product",
  //         "value": "specific_product"
  //     },
  //     "customer_gets_types": "amount_off_each",
  //     "customer_eligibility": "specific_customer",
  //     "maximum_discount_usage": "limit_number_of_times",
  //     "combination": [
  //         "product_discounts",
  //         "other_discounts"
  //     ],
  //     "start_date": "2024-12-18",
  //     "start_time": "20:15",
  //     "end_date": "2024-12-26",
  //     "end_time": "22:17",
  //     "buy_products_quantity": "",
  //     "discount_value": "78",
  //     "": "",
  //     "buy_products_amount": "67",
  //     "customer_gets_quantity": "98",
  //     "buy_products": [
  //         {
  //             "label": "BIscuit",
  //             "value": 227
  //         }
  //     ],
  //     "customer_specification": {
  //         "label": "Abandoned checkouts in the last 30 days",
  //         "value": "abandoned_checkouts"
  //     },
  //     "maximum_usage_value": "654",
  //     "coupon_type": "buy_x_get_y"
  // }

  const formConfig = useForm();
  const isEdit = location?.state?.isEdit;
  const editId = location?.state?.editId;

  const { watch, setValue } = formConfig;

  useEffect(() => {
    // const dummyData={
    //   "code": "BUYGET2024",
    //   "customer_buy_types":  "minimum_purchase_amount",
    //   "items_from": "all_product",
    //   "buy_products_quantity": 3,
    //   "buy_products_amount": 150,
    //   "buy_products": [12, 57, 23],
    //   "customer_gets_quantity": 2,
    //   "customer_gets_quantity": 50,
    //   "customer_gets_types": "free",
    //   "discount_value": 30,
    //   "customer_eligibility": "specific_customer",
    //   "customer_specification": "purchased_more_than_once",
    //   "maximum_discount_usage": "per_customer",
    //   "maximum_usage_value": 5,
    //   "combination": ["product_discounts", "order_discounts", "shipping_discounts"],
    //   "start_date": "2024-12-12",
    //   "start_time": "15:40",
    //   "end_date": "2024-12-16",
    //   "end_time": "18:42"
    // }

    if (isEdit) {
      toggleLoader("pageLoader");
      makeApiRequest({
        endPoint: `${DISCOUNT_ENDPOINT}${editId}`,
        method: METHODS.get,
      })
        .then((res) => {
          const fields = [
            "buy_products",
            "buy_products_amount",
            "buy_products_quantity",
            "code",
            "combination",
            "customer_buy_types",
            "coupon_type",
            "customer_buy_types",
            "customer_eligibility",
            "customer_gets_quantity",
            "customer_gets_quantity",
            "customer_specification",
            "customer_gets_types",
            "discount_value",
            "end_date",
            "end_time",
            "maximum_discount_usage",
            "maximum_usage_value",
            "start_date",
            "start_time",
          ];
          prefillFormValues(res.data, fields, setValue);
          // formConfig.reset(res.data);
          // for customer specification
          const extractedOption = extractOption(
            CUSTOMER_SPECIFIC_OPTIONS,
            res?.data?.customer_specification,
            "value"
          );
          setValue("customer_specification", extractedOption);
          const itemsFromExtractedOption = extractOption(
            ITEMS_FROM_OPTIONS,
            res?.data?.applies_to,
            "value"
          );
          setValue("applies_to", itemsFromExtractedOption);
          const itemsFromExtractedOption2 = extractOption(
            ITEMS_FROM_OPTIONS,
            res?.data?.get_applies_to,
            "value"
          );
          setValue("get_applies_to", itemsFromExtractedOption2);
          // setValue("applies_to", { label: "Specify product", value: "specific_product" });

          // for customer buys and customer gets products
          if (res?.data?.buy_products?.length) {
            const formattedProducts = convertPairFromProducts(
              res?.data?.buy_products
            );
            setValue("buy_products", formattedProducts);
          }
          if (res?.data?.customer_get_products) {
            const formattedProducts = convertPairFromProducts(
              res?.data?.customer_get_products
            );
            setValue("customer_get_products", formattedProducts);
          }
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
      "customer_specification",
      "maximum_discount_usage",
      "maximum_usage_value",
      // customer buys
      "customer_buy_types",
      "applies_to",
      "get_applies_to",
      "buy_products_quantity",
      // "buy_products_amount",
      "buy_products",
      // customer gets
      "customer_gets_quantity",
      "customer_gets_quantity",
      "customer_get_products",
      // discounted value
      "customer_gets_types",
      "discount_value",
    ];
    let payload = {};
    payloadKeys.forEach((key) => {
      if (values?.[key]) {
        if (
          key === "maximum_usage_value" ||
          key === "buy_products_quantity" ||
          key === "discount_value" ||
          // key === "buy_products_amount" ||
          key === "customer_gets_quantity" ||
          key === "customer_gets_quantity"
        ) {
          payload[key] = +values[key];
        } else if (
          key === "applies_to" ||
          key === "customer_specification" ||
          key === "get_applies_to"
        ) {
          payload[key] = values[key]?.value;
        } else if (key === "buy_products" || key === "customer_get_products") {
          if (values[key]?.length) {
            // payload[key] = values[key]?.map((el) => el.value || el);
            payload[key] = convertProductsIntoPairs(values?.[key]);
          }
        } else {
          payload[key] = values[key];
        }
      }
    });
    payload = {
      ...payload,
      coupon_type: "buy_x_get_y",
    };
    console.log(payload, "this is payload");
    setBtnLoaders({ ...btnLoaders, [buttonType]: !btnLoaders[buttonType] });
    makeApiRequest({
      endPoint: DISCOUNT_ENDPOINT,
      method: isEdit ? METHODS?.put : METHODS?.post,
      update_id: isEdit && editId,
      payload: payload,
    })
      .then((res) => {
        toastMessage("Discount created successfully", successType);
        navigate("/discounts");
      })
      .catch((err) => {
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
            <div className="flex flex-col gap-8 w-[calc(100%-320px)] discount-main-wrapper">
              <DiscountCodeSection formConfig={formConfig} />
              {/* add components for customer buys and customer gets here */}
              <CustomerBuys formConfig={formConfig} />
              <CustomerGets formConfig={formConfig} />
              <DiscountedValue formConfig={formConfig} />
              <CustomerEligibility formConfig={formConfig} />
              <DiscountUses formConfig={formConfig} />
              <Combinations formConfig={formConfig} />
              {/* <MinimumPurchaseRequirement formConfig={formConfig} /> */}
              <ActiveDates formConfig={formConfig} />
            </div>
            {/* sidebar */}
            <DiscountSideSection btnLoaders={btnLoaders}>
              <SummarySection formConfig={formConfig} />
              {/* need to add sidebar section */}
            </DiscountSideSection>
          </div>
        </FormWrapper>
      )}
    </div>
  );
};

export default BuyXGetY;
