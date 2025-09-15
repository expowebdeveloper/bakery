"use client";
import React, { useEffect, useState } from "react";
import RatingComponent from "./RatingComponent";
import CommonButton from "./_common/CommonButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import LocationField from "./_common/LocationField";
import { useForm } from "react-hook-form";
import { CART, CHECK_ZIP, PRODUCT_ENDPOINT } from "@/_Api Handlers/endpoints";
import { callApi, METHODS } from "@/_Api Handlers/apiFunctions";
const quantities = ["100gm", "150gm", "200gm"];
import { useParams } from "next/navigation";
import { toastMessage } from "@/_utils/toastMessage";
import { addItem } from "../../redux/cartSlice";
import { useDispatch } from "react-redux";
import { INSTANCE } from "@/_Api Handlers/apiConfig";

const SingleProductDetail = ({
  rating = 3,
  reviews = 6,
  product,
  selectedAddress,
}) => {
  const formConfig = useForm();
  const [count, setCount] = useState(1);
  const [showDescription, setShowDescription] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState("");
  const [zipCode, setZipCode] = useState();
  const [cartLoader, setCartLoader] = useState(false);
  const [zipCodeLoader, setZipCodeLoader] = useState(false);

  const params = useParams();
  const productId = params?.productId;

  const dispatch = useDispatch();

  const minQuantity = product?.product_detail?.advanced?.min_order_quantity
    ? product?.product_detail?.advanced?.min_order_quantity
    : 1;

  const handleCounter = (action) => {
    if (action === "increement") {
      setCount((prev) => prev + 1);
    } else {
      if (count > minQuantity) {
        setCount((prev) => prev - 1);
      }
    }
  };

  const handleCart = (payload) => {
    // event.stopPropagation();

    if (!selectedQuantity?.inventory?.id) {
      toastMessage("Please select a valid quantity", "error");
      return;
    }
    setCartLoader(true);

    callApi({
      endPoint: CART,
      method: "POST",
      instanceType: INSTANCE?.authorized,
      payload: {
        product_variant: selectedQuantity?.inventory?.id,
        quantity: count,
      },
    })
      .then((res) => {
        if (res?.data.error) {
          toastMessage(res?.data.error, "error");
          return;
        }
        dispatch(addItem(res.data));
        toastMessage("Product added successfully", "success");
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);
        toastMessage(error?.response?.data?.error, "error");
      }).finally(() => {
        setCartLoader(false);
      });
  };

  const stripHtmlTags = (html) => {
    return html?.replace(/<[^>]*>/g, "");

  };

  const handleSearch = () => {
    if (!zipCode) {
      toastMessage("Please enter a zip code", "error");
      return;
    }
    setZipCodeLoader(true);

    if (zipCode) {
      const payload = {
        zipcode: zipCode,
      };
      callApi({
        endPoint: CHECK_ZIP,
        method: METHODS.post,
        payload: payload,
      })
        .then((response) => {
          toastMessage(response.data?.delivery_message, "success");
        })
        .catch((err) => {
          console.error("Error fetching products:", err);
          toastMessage(err.response.data.message, "error");
        }).finally(() => {
          setZipCodeLoader(false);
        });
    }
  };


  return (
    <>
    <div>
      {/* <RatingComponent rating={rating} reviews={reviews} /> */}
      <div className="mb-5 border-b border-[#ccc]">
        <div className="text-[35px] font-normal leading-[42px] text-left text-black mb-2">
          {product?.name}
        </div>
        <div className="product-price product-code text-[60px] font-normal text-left text-[#ff9231] font-semibold">
          ${product?.product_detail?.inventory?.regular_price}
        </div>
      </div>
      <div className="mb-5 pb-4 border-b border-[#ccc]">
        <div className="product-code text-[16px] font-normal leading-[42px] text-left text-[#9E9E9E]">
          <span className="inline-block min-w-[200px] text-black">Product Code :</span> {product?.product_detail?.inventory?.sku}
        </div>
        <div className="product-code text-[16px] font-normal leading-[42px] text-left text-[#9E9E9E]">
          <span className="inline-block min-w-[200px] text-black">In Stock :</span> <span className="capitalize">{product?.status}</span>
        </div>
        <div className="quantity-section">
          <div className="flex items-center gap-6">
            <div className="min-w-[200px]">
              <div className="text-[16px] leading-[42px] inline-block font-normal text-left text-black min-w-[200px]">
                Min Quantity :
              </div>
              <div className="min-quantity inline-block text-[14px] text-[#999999]">{minQuantity}</div>
            </div>
          </div>
          <div className="text-[14px] font-semibold font-normal leading-[42px] text-left text-[#9E9E9E]">
            Minimum order quantities may vary based on your location
          </div>

        </div>
      </div>
      <div className="quantities mt-3 mb-4">
        <span className="inline-block text-[16px] min-w-[200px]">Variant:</span>
        {product?.product_detail?.variants?.map((qt) => (
          <CommonButton
            type="button"
            text={`${qt?.inventory?.weight} ${qt?.inventory?.unit}`}
            // className={`bg-[#FF6363] w-[94px] h-[40px] mr-2 rounded-[7px] `}
            disabled={qt?.inventory?.total_quantity < 1}
            className={`${qt === selectedQuantity ? "bg-[#ff9231] text-white" : "bg-[#E7E7E7]"
              } w-[94px] h-[40px] mr-2 rounded-[7px] ${qt?.inventory?.total_quantity < 1
                ? "cursor-not-allowed"
                : "cursor-pointer"
              }`}
            onClick={() => setSelectedQuantity(qt)}
          />
        ))}
      </div>
      <div className="flex gap-4 mb-5 mt-2">
        <div className="counterDiv flex-none">
          <div
            className="decreement w-[42px] h-[50px] flex items-center justify-center rounded-s-[8px] text-center text-[14px] flex-none"
            onClick={() => handleCounter("decrement")}
          >
            <FontAwesomeIcon icon={faMinus} />
          </div>
          <div className="count-display min-w-[30px] text-center">{count}</div>
          <div
            className="increement w-[42px] h-[50px] flex items-center rounded-e-[8px] justify-center text-center text-[14px] flex-none"
            onClick={() => handleCounter("increement")}
          >
            <FontAwesomeIcon icon={faPlus} />
          </div>
        </div>
        <CommonButton
          text="Add to cart"
          type="button"
          className="bg-customOrange text-[18px] rounded-lg text-white px-6 py-3 rounded-7px w-full"
          loader={cartLoader}
          onClick={() => handleCart(product)}
        />{" "}
      </div>
      <div className="deliver-location">
        <p className=" text-[#000000] mb-2">Deliver Location</p>
        <div className="flex gap-4 items-center">
          {selectedAddress ? (
            // -----------------------------------------------------------
            <div
              className={`border rounded-lg p-4 justify-between items-center shadow-sm`}
            >
              <div>
                <p className="text-sm font-medium">{`${selectedAddress.address},${selectedAddress.city},${selectedAddress.state}`}</p>
              </div>
            </div>
          ) : (
            // ------------------------------------------------------------
            <>
              <input
                type="text"
                value={zipCode}
                placeholder="Enter your zipcode"
                className="p-2 rounded-md outline-none text-gray-600 flex-grow border-2 border-black  pr-[195px]"
                maxLength={6}
                onChange={(e) => {
                  const numbersOnly = e.target.value.replace(/[^0-9]/g, "");
                  setZipCode(numbersOnly);
                }}
              />
              <CommonButton
                type="button"
                text="Change"
                className={`bg-[#ff9231] text-white w-[94px] h-[40px] mr-2 rounded-[7px] `}
                onClick={handleSearch}
                loader={zipCodeLoader}
              />
            </>
          )}
        </div>
      </div>
    </div>
    <div className="description flex items-center justify-between space-x-40 mt-5 mb-3">
      <p className="text-[#8F8F8F]">Description</p>
      {/* <FontAwesomeIcon
        className="text-[#8F8F8F] cursor-pointer"
        icon={showDescription ? faMinus : faPlus}
        onClick={() => setShowDescription((prev) => !prev)}
      /> */}
    </div>
    {/* {showDescription && stripHtmlTags(product?.description)} */}
    {stripHtmlTags(product?.description)}
    </>
  );
};

export default SingleProductDetail;
