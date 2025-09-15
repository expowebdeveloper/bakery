"use client";
import React, { useState, useCallback } from "react";
import CommonButton from "./_common/CommonButton";
import { CHECK_ZIP } from "@/_Api Handlers/endpoints";
import { callApi, METHODS } from "@/_Api Handlers/apiFunctions";
import { toastMessage } from "@/_utils/toastMessage";
import { useRouter } from "next/navigation";

const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const SearchBar = ({ setShowSearchSection }) => {
  const [zipCode, setZipCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchProducts = useCallback(async (zip) => {
    if (!zip) return;
    setLoading(true);
    try {
      const payload = { zipcode: zip };
      const response = await callApi({
        endPoint: CHECK_ZIP,
        method: METHODS.post,
        payload: payload,
      });
      toastMessage(response.data?.delivery_message, "success");
      setShowSearchSection((prev) => false)
      router.push("/products");
    } catch (err) {
      console.error("Error fetching products:", err);
      toastMessage(err.response?.data?.message || err.response?.data?.zipcode?.[0], "error");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const debouncedFetchProducts = useCallback(debounce(fetchProducts, 500), [fetchProducts]);

  const handleInputChange = (e) => {
    const numbersOnly = e.target.value.replace(/[^0-9]/g, "");
    setZipCode(numbersOnly);
    if (numbersOnly.length) {
      debouncedFetchProducts(numbersOnly);
    }
  };

  return (
    <>
      <p className="text-[18px] mb-2">
        Search Zipcode
      </p>
      <div className="flex items-center relative max-w-[900px] mx-auto">
        <input
          type="text"
          value={zipCode}
          placeholder="Enter your zipcode"
          className="pl-5 py-4 rounded-full outline-none text-gray-600 flex-grow border-2 border-red-500 pr-[195px]"
          maxLength={6}
          onChange={handleInputChange}
        />
        {/* <CommonButton
          text="Find"
          type="button"
          className="bg-red-500 text-white px-6 py-3 max-w-[182px] w-full rounded-full ml-2 absolute top-1/2 -translate-y-1/2 right-[6px]"
          onClick={() => fetchProducts(zipCode)}
          loader={loading}
        /> */}
      </div>
      <p className="max-w-[1000px] text-[16px] mx-auto mt-2 text-gray-400">
        Enter your zip code to discover products and offers available near you.
      </p>
    </>
  );
};

export default SearchBar;
