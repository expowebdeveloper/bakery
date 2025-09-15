"use client";
import React, { useState } from "react";
const SavedAddresses = ({
  handleAddNew,
  addresses,
  handleAddress,
  coupon,
  handleApplyCoupon,
  selectedAddress,
  selectedCoupon,
}) => {
  const [showAllCoupons, setShowAllCoupons] = useState(false);
  const [enteredCoupon, setEnteredCoupon] = useState("");
  // const addresses = [
  //   {
  //     address: "Storgatan 45, 2 tr (2nd floor), 123 45 Göteborg, Sweden",
  //     time: "39 Mins",
  //   },
  //   {
  //     address: "Storgatan 45, 2 tr (2nd floor), 123 45 Göteborg, Sweden",
  //     time: "45 Mins",
  //   },
  //   {
  //     address: "Storgatan 45, 2 tr (2nd floor), 123 45 Göteborg, Sweden",
  //     time: "19 Mins",
  //   },
  //   {
  //     address: "Storgatan 45, 2 tr (2nd floor), 123 45 Göteborg, Sweden",
  //     time: "22 Mins",
  //   },
  // ];

  const handleSeeAllOffers = () => {
    setShowAllCoupons(!showAllCoupons);
  };

  const handleCouponChange = (event) => {
    setEnteredCoupon(event.target.value);
  };

  const handleCouponApply = () => {
    if (enteredCoupon) {
      handleApplyCoupon(enteredCoupon);
    }
  };

  return (
    <div className="p-4">
      <div className="">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Saved Addresses</h2>
          <button
            className="bg-pink-500 text-white px-4 py-2 rounded"
            onClick={handleAddNew}
            type="button"
          >
            Add New
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {addresses.length > 0 ? (
            addresses?.map((item, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 justify-between items-center shadow-sm ${
                  selectedAddress === item ? "bg-[#FFFAF4]" : ""
                }`}
              >
                <div>
                  <p className="text-sm font-medium">{`${item.address},${item.city},${item.state}`}</p>
                </div>
                <div className="text-right flex justify-between items-center mt-2">
                  <button
                    className={
                      selectedAddress === item
                        ? "text-black"
                        : "bg-red-500 text-white px-2 py-2 rounded-md"
                    }
                    type="button"
                    onClick={() => handleAddress(item)}
                  >
                    {selectedAddress === item
                      ? "Current Address"
                      : "Deliver Here"}
                  </button>
                  <div className="text-xs text-gray-500 mb-2">
                    {item.time ? item.time : "45 Mins"}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>No Saved Addresses</div>
          )}
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-4">Apply Coupon</h2>
      <div className="p-4 border mt-4 rounded-lg">
        <div className="flex justify-between mb-2">
          <div className="text-lg font-semibold">Available Coupon</div>
          <div
            className="text-[#FF6363] cursor-pointer"
            onClick={handleSeeAllOffers}
          >
            {showAllCoupons ? "See fewer offers" : "See all offers"}
          </div>
        </div>
        {/* {(showAllCoupons ? coupon : coupon?.slice(0, 1))?.map((coup, index) => (
          <div
            className="border rounded-lg p-2 mb-4 flex justify-between items-center shadow-sm bg-[#FFFAF4] border-[#FF6363]"
            key={index}
          >
            <div>
              <p className="text-sm font-medium">
                {coup?.coupon_details?.discount_types === "amount"
                  ? `Flat $${coup?.coupon_details?.discount_value} off on your purchase. ${coup?.coupon_details?.code}`
                  : `Flat ${coup?.coupon_details?.discount_value}% off on your purchase. ${coup?.coupon_details?.code}`}
              </p>
            </div>
            <button
              className="text-white px-6 py-1 rounded-lg border bg-[#FF6363]"
              type="button"
              onClick={() => handleApplyCoupon(coup?.coupon_details?.code)}
            >
              {coup?.coupon_details?.code === selectedCoupon
                ? "Applied"
                : "Apply"}
            </button>
          </div>
        ))} */}

        {coupon?.length > 0 ? (
          (showAllCoupons ? coupon : coupon?.slice(0, 1))?.map(
            (coup, index) => (
              <div
                className="border rounded-lg p-2 mb-4 flex justify-between items-center shadow-sm bg-[#FFFAF4] border-[#FF6363]"
                key={index}
              >
                <div>
                  <p className="text-sm font-medium">
                    {coup?.coupon_details?.discount_types === "amount"
                      ? `Flat $${coup?.coupon_details?.discount_value} off on your purchase. ${coup?.coupon_details?.code}`
                      : `Flat ${coup?.coupon_details?.discount_value}% off on your purchase. ${coup?.coupon_details?.code}`}
                  </p>
                </div>
                <button
                  className="text-white px-6 py-1 rounded-lg border bg-[#FF6363]"
                  type="button"
                  onClick={() => handleApplyCoupon(coup?.coupon_details?.code)}
                >
                  {coup?.coupon_details?.code === selectedCoupon
                    ? "Applied"
                    : "Apply"}
                </button>
              </div>
            )
          )
        ) : (
          <p className="text-gray-500 text-sm">No coupons available</p>
        )}

        <div className="flex items-center gap-4 mt-4">
          <input
            type="text"
            placeholder="Enter Coupon"
            className="border rounded-lg p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={enteredCoupon}
            onChange={handleCouponChange}
          />
          <button
            className={`bg-[#FF6363] text-white px-6 py-2 rounded-lg ${
              enteredCoupon.length < 1 ? "cursor-not-allowed" : "cursor-pointer"
            }`}
            type="button"
            onClick={handleCouponApply}
            disabled={enteredCoupon.length < 1}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedAddresses;
