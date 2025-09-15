"use client";
import { callApi, METHODS } from "@/_Api Handlers/apiFunctions";
import { HOT_DEALS_ENDPOINT } from "@/_Api Handlers/endpoints";
import { createPreview } from "@/_utils/helpers";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import limitedImageRight from '../../public/images/limitedImageRight.png'
import limitedImageLeft from '../../public/images/limitedImageLeft.png'

const LimitedTimeOffers = () => {
  const [hotDeals, setHotDeals] = useState([]);

  const router = useRouter();

  useEffect(() => {
    callApi({
      endPoint: HOT_DEALS_ENDPOINT,
      method: METHODS.get,
    })
      .then((response) => {
        setHotDeals(response.data);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
      });
  }, []);

  const capitalizeName = (str) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    // <div className="text-center py-12 ">
    //   <p className="text-eyebrowColor font-semibold text-[20px] mb-7 text-center">Limited Time Offers</p>
    //   <h4 className="uppercase text-4xl md:text-5xl font-bebas text-center mb-10">
    //     <span className="text-customOrange font-bebas">Hot Deals fresh</span> Out {" "}
    //     Of The Oven
    //   </h4>{" "}
    // </div>
    <section className="bg-white limited-section text-center py-[80px] px-10">
      <Image src={limitedImageRight} className="limit-image-left" />
      <Image src={limitedImageLeft} className="limit-image-right" />
      <h2 className="text-sm text-[#813D33] uppercase">Limited Time Offers</h2>
      <h1 className="text-4xl font-bold text-red-500 mt-2">
        HOT DEALS FRESH OUT <span className="text-black">OF THE OVEN!</span>
      </h1>
      <div className="flex items-center justify-center mt-4 max-w-[1400px] mx-auto mb-[80px]">
      <div className="text-gray-600 text-wrap text-center text-start">
          Get your hands on our exclusive deals, fresh from the oven! Enjoy
          special discounts on your favorite treats for a limited time only.
        </div>
        {/* Countdown Timer */}
        {/* <div className="flex justify-center items-center space-x-4">
          <div className="bg-[#FF6363] p-3 rounded-xl">
            <div className="text-xl font-bold text-white">02</div>
          </div>
          <div className="bg-[#FF6363] px-2 py-1  rounded-xl">
            <div className="text-xl font-bold text-white">20</div>
            <div className="text-xs text-white">Hours</div>
          </div>
          <div className="bg-[#FF6363] p-3 rounded-xl">
            <div className="text-xl font-bold text-white">50</div>
          </div>
          <div className="bg-[#FF6363] p-3 rounded-xl">
            <div className="text-xl font-bold text-white">21</div>
          </div>
        </div> */}
      </div>
      {/* Offers Section */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {hotDeals?.map((offer, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-lg p-6 text-left relative shadow-[0px_10px_30px_0px_rgba(243,214,194,0.5)]"
          >
            <img
              src={createPreview(offer?.feature_image?.image)}
              alt={offer.name}
              className="w-[170px] rounded-lg object-cover mx-auto h-[170px] object-cover rounded-md"
            />
            <div>
              <h4 className="text-lg font-bold mt-6 !text-[20px] mb-8 text-black flex justify-center">
                {offer.name}
              </h4>
            </div>
            {/* <div className="text-gray-500 mt-2 border">
              Starts from{" "}
              <span className="text-red-500 font-bold">${offer.newPrice}</span>{" "}
              <span className="line-through">${offer.oldPrice}</span>
            </div>
            <p className="text-gray-600">Min Quantity: {offer.minQuantity}</p> */}
            <div className="flex justify-between">
              <div>
                <div className="text-black">Starts from</div>
                <div>
                  <span className="line-through font-bold text-[24px] me-2 text-[#C2C2C2]">
                    ${offer?.product_detail?.inventory?.regular_price}
                  </span>
                  <span className="text-[#FF2F2F] font-bold text-[24px]">
                    ${offer?.product_detail?.inventory?.sale_price}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-black">Min Quantity</div>
                <div className="text-[#FF2F2F] text-lg font-bold">
                  {offer?.product_detail?.advanced?.min_order_quantity}
                </div>
              </div>
            </div>
            {/* <div className="flex justify-center mt-4"> */}
            <button
              className="text-black absolute rounded-full py-1 px-2 bg-[#FFE794] w-[54px] h-[54px] bottom-[-28px] shadow-[-4px_4px_16px_0px_#D4D0C2] left-[50%] translate-x-[-50%]"
              onClick={() => router.push(`/products/${offer?.id}`)}
            >
              &rarr;
            </button>
            {/* </div> */}
          </div>
        ))}
      </div>
    </section>
  );
};

export default LimitedTimeOffers;
