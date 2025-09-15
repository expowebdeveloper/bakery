"use client";
import { createPreview } from "@/_utils/helpers";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import debounce from "lodash.debounce";
import { toastMessage } from "@/_utils/toastMessage";
import { callApi } from "@/_Api Handlers/apiFunctions";
import { INSTANCE } from "@/_Api Handlers/apiConfig";
import { CART } from "@/_Api Handlers/endpoints";
import CommonButton from "./_common/CommonButton";
import { PRICE_UNIT } from "@/_constants/constant";
import { T } from "@/utils/languageTranslator";
import MessageModal from "./MessageModal";

const SummarySection = ({
  summaryProducts,
  updateCart,
  cartData,
  checkoutLoader,
}) => {
  const [quantities, setQuantities] = useState({});
  const [showMessage, setShowMessage] = useState(false);
  const [previousQuantities, setPreviousQuantities] = useState({});
  const pendingQuantities = useRef({});
  const router = useRouter();
  let token;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  useEffect(() => {
    // Only set initial quantities if they haven't been set yet
    if (Object.keys(quantities).length === 0) {
      const initialQuantities = summaryProducts.reduce((acc, item) => {
        acc[item.id] = item.quantity;
        return acc;
      }, {});
      setQuantities(initialQuantities);
      setPreviousQuantities(initialQuantities);
    }
  }, [summaryProducts]);

  const debouncedUpdateQuantity = debounce(async (id, newQuantity) => {
    callApi({
      endPoint: `${CART}${id}/`,
      method: "PUT",
      instanceType: INSTANCE?.authorized,
      payload: {
        quantity: newQuantity,
      },
    })
      .then((res) => {
        if (res.data.error) {
          toastMessage(res.data.error, "error");
          return;
        }
        setPreviousQuantities((prev) => ({
          ...prev,
          [id]: newQuantity,
        }));
        pendingQuantities.current[id] = newQuantity;
        updateCart();
        toastMessage("Product updated successfully", "success");
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);
        setQuantities((prev) => ({
          ...prev,
          [id]: previousQuantities[id],
        }));
        toastMessage(
          error?.response?.data?.error || "Something went wrong",
          "error"
        );
      });
  }, 500);

  const handleQuantityChange = (id, type) => {
    setQuantities((prevQuantities) => {
      const currentQuantity = prevQuantities[id];

      if (type === "decrement" && currentQuantity === 1) {
        callApi({
          endPoint: `${CART}${id}/`,
          method: "DELETE",
          instanceType: INSTANCE?.authorized,
        })
          .then((res) => {
            toastMessage("Product Deleted Successfully", "success");
            updateCart();
          })
          .catch((error) => {
            toastMessage("Something went wrong, Please try again", "error");
          });
        return prevQuantities;
      }

      const newQuantity =
        type === "increment" ? currentQuantity + 1 : currentQuantity - 1;

      // Update state optimistically
      const updatedQuantities = {
        ...prevQuantities,
        [id]: Math.max(newQuantity, 1),
      };

      // Track the pending quantity for API
      pendingQuantities.current[id] = updatedQuantities[id];

      // Trigger the debounced API call
      debouncedUpdateQuantity(id, updatedQuantities[id]);

      return updatedQuantities;
    });
  };

  const handleConfirm = () => {
    if (!token) {
      setShowMessage(true);
      // localStorage.setItem("isCheckout", true);
      // router.push("/login");
    }
  };

  const capitalizeName = (str) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div>
      <div className="flex flex-col p-5 bg-[#FFFAF4] shadow-lg rounded-lg w-96 flex-1 h-full justify-between border">
        <div className="">
          <ul className="space-y-4">
            {cartData?.items?.length ? (
              summaryProducts?.map((item) => (
                <li key={item.id} className="flex items-center">
                  <div className="flex-grow">
                    <p className="font-medium text-black">
                      {capitalizeName(item?.product_variant?.name)}
                    </p>
                    <p className="text-sm text-[#FF6363]">
                      ${item?.product_variant?.inventory?.regular_price}
                    </p>
                  </div>
                  <div className="flex bg-white border flex-col items-center px-1 rounded-md border-black">
                    <button
                      className=" text-black cursor-pointer"
                      onClick={() => handleQuantityChange(item.id, "decrement")}
                      type="button"
                    >
                      -
                    </button>
                    <div className="">{quantities[item.id]}</div>
                    <button
                      className="text-red-500 cursor-pointer"
                      onClick={() => handleQuantityChange(item.id, "increment")}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <div className="text-black">No items</div>
            )}
          </ul>
        </div>

        <div>
          <div className="flex justify-between mt-4 border-t">
            <span className="font-semibold">Subtotal</span>
            <span className="font-semibold">
              {cartData?.total_price} {PRICE_UNIT}
            </span>
          </div>
          <div className="flex justify-between mt-2">
            <span className="font-semibold">{T["vat"]}</span>
            <span className="font-semibold">
              {cartData?.vat_amount || "0.00"} {PRICE_UNIT}
            </span>
          </div>
          {/* commented for future use */}
          {/* <div className="flex justify-between mt-2">
            <span className="font-semibold">Platform Fee</span>
            <span className="font-semibold">{cartData?.platform_fee || "0.00"} {" "}{PRICE_UNIT}</span>
          </div> */}
          {/* commented for future use */}
          {/* <div className="flex justify-between mt-2">
            <span className="font-semibold">{T["packing_fee"]}</span>
            <span className="font-semibold">{cartData?.packing_fee || "0.00"} {" "}{PRICE_UNIT}</span>
          </div> */}
          <div className="flex justify-between mt-2">
            <span className="font-semibold">{T["shipping_charges"]}</span>
            <span className="font-semibold">
              {cartData?.shipping_cost || "0.00"} {PRICE_UNIT}
            </span>
          </div>
          {cartData?.applied_coupon ? (
            <div className="flex justify-between text-green-600">
              <p>{`Discount Applied (${cartData?.applied_coupon_name})`}</p>
              <p>{`-${cartData?.discounted_price || "0.00"} ${PRICE_UNIT}`}</p>
            </div>
          ) : (
            <div className="flex justify-between text-green-600">
              <p className="flex justify-between text-green-600">{`Discount Applied `}</p>
              <p>{`-${cartData?.discounted_price || "0.00"} ${PRICE_UNIT}`}</p>
            </div>
          )}
          <div className="flex justify-between mt-2 border-t pt-2">
            <span className="font-bold">{T["total"]}</span>
            <span className="font-bold text-lg text-[#FF6363]">
              $
              {Number(cartData?.total_with_vat) +
                Number(cartData?.shipping_cost)}
            </span>
          </div>

          <CommonButton
            className="mt-5 bg-btnBackground text-white font-bold py-2 rounded-lg hover:bg-orange-700 transition duration-200 w-full"
            type={token ? "submit" : "button"}
            onClick={handleConfirm}
            loader={checkoutLoader}
            text="Confirm Order"
          />
        </div>
      </div>
      {showMessage && <MessageModal onCancel={() => setShowMessage(false)} />}
    </div>
  );
};

export default SummarySection;
