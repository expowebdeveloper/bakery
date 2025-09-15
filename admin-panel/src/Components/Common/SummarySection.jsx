import React from "react";
import {
  checkedIcon,
  copyToClipboardIcon,
  dateIcon,
} from "../../assets/Icons/Svg";
import useCopyToClipboard from "../../hooks/useCopyToClipboard";
import { formatTime, showCombination } from "../../utils/helpers";
import { DISCOUNTED_VALUE_OPTIONS, PRICE_UNIT } from "../../constant";

const SummarySection = ({ formConfig }) => {
  const { handleCopy, isCopied } = useCopyToClipboard();
  const { watch } = formConfig;
  const {
    code,
    discount_types,
    discount_value,
    shipping_scope,
    combination,
    customer_specification,
    maximum_discount_usage,
    maximum_usage_value,
    start_date,
    states,
    end_date,
    minimum_quantity_value,
    end_time,
    start_time,
    customer_eligibility,
    applies_to,
    minimum_purchase_requirement,
    minimum_purchase_value,
    shipping_rate,
    exclude_shipping_rate,
    customer_buy_types,
    items_from,
    buy_products_quantity,
    buy_products_amount,
    buy_products,
    customer_gets_amount,
    customer_gets_quantity,
    products,
  } = watch();
  const SPECIFIC_CUSTOMER_TO_VALUE = {
    havent_purchased: "- For Customers who have not purchased",
    recent_purchased: "- For Customers who have purchased recently",
    purchased_once: "- For Customers who have purchased at least once ",
    purchased_more_than_once:
      "- For Customers who have purchased more than once",
  };
  const DISCOUNT_TYPE_TO_TEXT = {
    percentage: "Percentage",
    amount_off_each: "Amount off each",
    free: "Free",
  };

  const showCustomerEligibility = () => {
    if (customer_eligibility === "all_customer") {
      return "- For All customers";
    } else if (
      customer_eligibility === "specific_customer" &&
      customer_specification
    ) {
      return SPECIFIC_CUSTOMER_TO_VALUE[customer_specification?.value];
    }
  };
  const showDiscountUsage = () => {
    if (maximum_discount_usage === "per_customer") {
      return "-Limited to one use per user";
    } else if (
      maximum_discount_usage === "limit_discount_usage_time" &&
      maximum_usage_value
    ) {
      return `-Can be used a maximum of ${maximum_usage_value} times in total`;
    }
  };
  const listStates = (states) => {
    if (states?.length) {
      const formattedStats = states?.map((state) => state?.label).join(", ");
      return formattedStats;
    }
  };
  const listProducts = (products) => {
    console.log(products, "inside list products");
    if (products?.length) {
      const formattedProducts = products
        ?.map((product) => product?.label)
        .join(", ");

      return formattedProducts;
    }
  };
  const shouldShowBuySection = () => {
    if (
      customer_buy_types &&
      (buy_products_quantity || buy_products_amount) &&
      (items_from?.value === "specific_product"
        ? buy_products?.length
        : items_from?.value === "all_product"
        ? true
        : false)
    ) {
      return true;
    }
    return false;
  };
  const shouldShowGetSection = () => {
    if (
      customer_buy_types &&
      (customer_gets_quantity || customer_gets_amount) &&
      (items_from?.value === "specific_product"
        ? buy_products?.length
        : items_from?.value === "all_product"
        ? true
        : false)
    ) {
      return true;
    }
    return false;
  };
  return (
    <div>
      {" "}
      <div className="bg-white p-5 rounded-lg border border-[#E2E2E2]">
        <div className="border-b mb-6 font-semibold	">Summary</div>
        {code && (
          <div className="mb-6 font-semibold flex items-center space-x-4">
            <div className="text">Discount Code : </div>
            <div className="text">{code}</div>
            <div className="icon" onClick={() => handleCopy(code)}>
              {isCopied ? checkedIcon : copyToClipboardIcon}
            </div>
          </div>
        )}
        {discount_types?.label ? (
          <div className="mb-4">
            <div className="mb-2">Type and method</div>
            <div className="text-nowrap text-[#969696]">
              -Type : {discount_types?.label}
            </div>
            {discount_value ? (
              <div className="text-wrap text-[#969696]">
                -Value :{" "}
                {discount_types?.value === "percentage"
                  ? `${discount_value} % `
                  : discount_types?.value === "amount"
                  ? `${discount_value} ${PRICE_UNIT}`
                  : ""}
              </div>
            ) : (
              ""
            )}
          </div>
        ) : (
          ""
        )}
        <div className="mb-4">
          <div className="mb-2">Details</div>
          {/* customer eligibility */}
          {customer_eligibility && (
            <div className="text-wrap text-[#969696]">
              {showCustomerEligibility()}
            </div>
          )}
          {/* customer eligibility */}
          {/* for applies to  */}
          {applies_to?.label && (
            <div className="text-wrap text-[#969696]">
              -Applies to {applies_to?.label}{" "}
              {applies_to?.value === "specific_products" &&
                listProducts(products)}
            </div>
          )}
          {/* for applies to  */}

          <div className="text-wrap text-[#969696]">
            {showDiscountUsage()}
          </div>
          {/* combinations */}
          <div className="text-wrap text-[#969696]">
            {combination?.length
              ? `-Can Combine with ${showCombination(combination)}`
              : "-Can't Combine with others"}
          </div>
          {/* combinations */}

          {/* shiping scope */}
          {shipping_scope && (
            <div className="text-wrap text-[#969696]">
              {shipping_scope === "all_states"
                ? "-Applies for all states"
                : shipping_scope === "specific_states" && states?.length
                ? `-Applies for ${listStates(states)}`
                : ""}
            </div>
          )}
          {exclude_shipping_rate && shipping_rate ? (
            <div className="text-wrap text-[#969696]">
              -Exclude shipping rates over {shipping_rate} {" "} {PRICE_UNIT}
            </div>
          ) : (
            ""
          )}
          {/* shiping scope */}

          {/* <div className="text-wrap text-[#969696]">- Discounts</div> */}

          {/* <div className="text-wrap text-[#969696]">- Active today</div> */}
          {/* minimum purchase requirement */}
          {minimum_purchase_requirement && (
            <>
              {minimum_purchase_requirement === "no_requirement" && (
                <div className="text-wrap text-[#969696]">
                  -This product has no minimum purchase or quantity requirements
                </div>
              )}
              {minimum_purchase_requirement === "minimum_purchase" &&
                minimum_purchase_value && (
                  <div className="text-wrap text-[#969696]">
                    {`-This product requires a minimum purchase of $ ${minimum_purchase_value}`}
                  </div>
                )}
              {minimum_purchase_requirement === "minimum_items" &&
                minimum_quantity_value && (
                  <div className="text-nowrap text-[#969696]">
                    {`-This product Requires a minimum of ${minimum_quantity_value} items to be purchased`}
                  </div>
                )}
            </>
          )}
          {/* minimum purchase requirement */}

          {/* customer buys and customer gets  */}
          {shouldShowBuySection() && (
            <div className="text-nowrap text-[#969696] flex flex-col gap-2">
              {" "}
              -If customer buys{" "}
              {buy_products_quantity && `${buy_products_quantity} items`}
              {buy_products_amount && ` ${buy_products_amount} ${PRICE_UNIT}`} of{"   "}
              {items_from?.value === "specific_product"
                ? listProducts(buy_products)
                : // : "Any product"}
                  ""}
            </div>
          )}
          {/* customer buys and customer gets  */}

          {shouldShowGetSection() && (
            <div className="text-nowrap text-[#969696] flex flex-col gap-2">
              {" "}
              -Customer gets{" "}
              {customer_gets_quantity && `${customer_gets_quantity} items`}
              {customer_gets_amount && ` $${customer_gets_amount}`} of{" "}
              {items_from === "specific_product"
                ? listProducts(buy_products)
                : "Any product"}
            </div>
          )}
          {/* customer buys and customer gets  */}

          {/* discounted value */}
          {/* {discount_types?.label && (
            <div className="text-nowrap text-[#969696]">
              {" "}
              - Discounted value :{" "}
              {DISCOUNT_TYPE_TO_TEXT[discount_types?.value]}
            </div>
          )} */}
          {/* {discount_value && (
            <div className="text-nowrap text-[#969696]">
              -Discounted value :{" "}
              {discount_types?.value === "percentage"
                  ? `${discount_value} % `
                  : discount_types?.value === "amount"
                  ? `$ ${discount_value}`
                  : ""}
            </div>
          )} */}
          {/* discounted value */}
        </div>

        <div className="mb-4">
          <div className="mb-2">Performance</div>
          <div className="text-nowrap text-[#969696] flex flex-col gap-2">
            {/* - Discount is not active yet */}
            {start_date && <div>-Start Date : {start_date}</div>}{" "}
            {end_date && <div>-End Date : {end_date}</div>}
            {start_time && <div>-Start Time : {formatTime(start_time)}</div>}
            {end_time && <div>-End Time : {formatTime(end_time)}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummarySection;
