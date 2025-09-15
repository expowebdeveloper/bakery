"use client";

import { INSTANCE } from "@/_Api Handlers/apiConfig";
import { callApi } from "@/_Api Handlers/apiFunctions";
import {
  ADDRESS,
  APPLY_COUPON,
  CHECKOUT,
  GET_CART,
  USER_COUPON,
} from "@/_Api Handlers/endpoints";
import BillingDetailsSection from "@/_components/BillingDetailsSection";
import DeliveryDetailsSection from "@/_components/DeliveryDetailsSection";
import SavedAddresses from "@/_components/SavedAddress";
import SummarySection from "@/_components/SummarySection";
import { toastMessage } from "@/_utils/toastMessage";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { addItem, clearCart, replaceItem } from "../../../../redux/cartSlice";
import { useRouter } from "next/navigation";
import ThankYou from "@/_components/ThankYou";
import Cookies from "js-cookie";
import axios from "axios";

const BillingDetails = () => {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState();
  const [coupon, setCoupon] = useState([]);
  const [cartID, setCartID] = useState();
  const [checkoutResponse, setCheckoutResponse] = useState(null);
  const [selectedCoupon, setSelectedCoupon] = useState("");
  const [cartData, setCartData] = useState(null);
  const [checkoutLoader, setCheckoutLoader] = useState(false);
  const formConfig = useForm();
  const { handleSubmit } = formConfig;

  const dispatch = useDispatch();
  const router = useRouter();

  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

  const sessionId = Cookies.get("session_id");

  // let token = localStorage.getItem("token");
  let token;

  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  useEffect(() => {
    callApi({
      endPoint: ADDRESS,
      method: "GET",
      instanceType: INSTANCE?.authorized,
    })
      .then((res) => {
        setAddresses(res?.data?.results);
        setSelectedAddress(
          res?.data?.results.find((ele) => ele.primary === true)
        );
      })
      .catch((error) => {
        console.error("Error getting address:", error);
      });

    callApi({
      endPoint: USER_COUPON,
      method: "GET",
      instanceType: INSTANCE?.authorized,
    })
      .then((res) => {
        setCoupon(res?.data?.results);
      })
      .catch((error) => {
        console.error("Error getting address:", error);
      });
  }, []);

  // useEffect(() => {
  //   dispatch(clearCart());
  //   callApi({
  //     endPoint: GET_CART,
  //     method: "GET",
  //     instanceType: INSTANCE?.authorized,
  //   })
  //     .then((res) => {
  //       if (res?.data?.items?.length > 0) {
  //         res?.data?.items?.forEach((item) => {
  //           setCartID(res?.data?.id);
  //           dispatch(addItem(item));
  //           setCartData(res?.data)
  //         });
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error adding to cart:", error);
  //     });
  // }, []);

  useEffect(() => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    //      dispatch(clearCart());
    // callApi({
    //   endPoint: GET_CART,
    //   method: "GET",
    //   instanceType: INSTANCE?.authorized,
    // })
    //   .then((res) => {
    //     if (res?.data?.items?.length > 0) {
    //       setCartID(res?.data?.id);
    //       setCartData(res?.data)
    //       res?.data?.items?.forEach((item) => {
    //         // setCartID(res?.data?.id);
    //         dispatch(addItem(item));
    //         // setCartData(res?.data)
    //       });
    //     }
    //   })
    //   .catch((error) => {
    //     console.error("Error adding to cart:", error);
    //   });

    dispatch(clearCart());
    const payload = {
      delivery_address: selectedAddress?.id,
    };
    axios
      .post(`${baseURL}/cart/`, payload, {
        headers,
        withCredentials: true,
      })
      .then((res) => {
        setCartID(res?.data?.id);
        setCartData(res?.data);
        if (res?.data?.items?.length > 0) {
          res?.data?.items?.forEach((item) => {
            dispatch(addItem(item));
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching cart data:", error);
      });
  }, [selectedAddress]);

  const onSubmit = (values) => {
    const payload = {
      name: values?.name,
      email: values?.email,
      contact_no: values?.phone_number,
      address: values?.address?.formatted_address || values?.address,
      city: values?.city?.formatted_address || values?.city,
      state: values?.state?.value || values?.state,
      zipcode: values?.zip_code,
      // "country": "SE",
      primary: true,
    };
    if (showAddressForm) {
      callApi({
        endPoint: ADDRESS,
        method: "POST",
        instanceType: INSTANCE?.authorized,
        payload: payload,
      })
        .then((res) => {
          setSelectedAddress(res.data);
          handleCheckout(res.data);
          toastMessage("Order placed successfully", "success");
        })
        .catch((error) => {
          console.error("Error adding to cart:", error);
          toastMessage(
            error?.response?.data?.message || "Something went wrong",
            "error"
          );
        });
    } else {
      handleCheckout();
    }
  };

  const summaryProducts = [
    {
      id: 1,
      name: "Premium Croissant",
      price: 20,
      quantity: 10,
      img: "/images/bread.png",
    },
    {
      id: 2,
      name: "Premium Bread",
      price: 30,
      quantity: 20,
      img: "/images/bread.png",
    },
    {
      id: 3,
      name: "Premium Biscuit",
      price: 40,
      quantity: 30,
      img: "/images/bread.png",
    },
  ];

  const handleAddNew = () => {
    setShowAddressForm(true);
  };

  const handleAddress = (item) => {
    setSelectedAddress(item);
    toastMessage("Address selected successfully", "success");
  };

  const handleCheckout = (data) => {
    if (!selectedAddress && !data) {
      toastMessage("Please select address", "error");
      return;
    }
    setCheckoutLoader(true);
    const payload = {
      shipping_address_id: selectedAddress?.id || data?.id,
    };
    callApi({
      endPoint: CHECKOUT,
      method: "POST",
      instanceType: INSTANCE?.authorized,
      payload: payload,
    })
      .then((res) => {
        // router.push("/home");
        toastMessage("Order placed successfully", "success");
        setCheckoutResponse(res.data);
        dispatch(clearCart());
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);
        toastMessage(
          error?.response?.data?.message ||
            error?.response?.data?.detail ||
            "Something went wrong",
          "error"
        );
      })
      .finally(() => {
        setCheckoutLoader(false);
      });

    setSelectedAddress(null);
  };

  const updateCart = () => {
    const payload = {
      delivery_address: selectedAddress?.id,
    };
    callApi({
      endPoint: GET_CART,
      method: "POST",
      instanceType: INSTANCE?.authorized,
      payload: payload,
    })
      .then((res) => {
        if (res?.data?.items?.length > 0) {
          setCartID(res?.data?.id);
          dispatch(clearCart());
          setCartData(res?.data);
          res?.data?.items?.forEach((item) => {
            dispatch(replaceItem(item));
          });
        } else {
          dispatch(clearCart());
        }
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);
      });
  };

  const handleApplyCoupon = (couponCode) => {
    const payload = {
      coupon_code: couponCode,
      cart_id: cartID,
    };

    callApi({
      endPoint: APPLY_COUPON,
      method: "POST",
      instanceType: INSTANCE?.authorized,
      payload: payload,
    })
      .then((res) => {
        toastMessage("Coupon Applied", "success");
        setSelectedCoupon(couponCode);
        updateCart();
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);
        toastMessage(
          `${error?.response?.data?.detail || error?.response?.data?.error}`,
          "error"
        );
      });
  };

  const cartItems = useSelector((state) => state.cart.items);

  return checkoutResponse ? (
    <ThankYou checkoutResponse={checkoutResponse} />
  ) : cartItems.length < 1 ? (
    <div className="flex flex-col justify-center items-center h-screen space-y-4">
      <h2 className="text-xl font-semibold">No cart items available</h2>
      <div
        className="border p-4 rounded-full bg-[#FFDC83] cursor-pointer"
        onClick={() => router.push("/products")}
      >
        Continue Shopping
      </div>
    </div>
  ) : (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-6 p-6">
          {token && (
            <div className="flex flex-col gap-6 pl-10 flex-1">
              {showAddressForm ? (
                <>
                  <BillingDetailsSection formConfig={formConfig} />
                  {/* <DeliveryDetailsSection formConfig={formConfig} /> */}
                </>
              ) : (
                <SavedAddresses
                  handleAddNew={handleAddNew}
                  addresses={addresses}
                  handleAddress={handleAddress}
                  coupon={coupon}
                  handleApplyCoupon={handleApplyCoupon}
                  selectedAddress={selectedAddress}
                  selectedCoupon={selectedCoupon}
                />
              )}
            </div>
          )}
          <div className={`flex justify-center ${!token && "w-full"}`}>
            <SummarySection
              summaryProducts={cartItems}
              updateCart={updateCart}
              cartData={cartData}
              checkoutLoader={checkoutLoader}
              onClearCartClick={() => {}}
            />
          </div>
        </div>
      </form>
    </>
  );
};

export default BillingDetails;
