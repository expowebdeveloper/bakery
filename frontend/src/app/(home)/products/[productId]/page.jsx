"use client";
import React, { useState, useEffect } from "react";
import CardComponentOne from "@/_components/_common/CardComponentOne";
import SingleProductHeader from "@/_components/SingleProductHeader";
import Image from "next/image";
import RatingComponent from "@/_components/RatingComponent";
import ProductCarousel from "@/_components/ProductCarousel";
import SingleProductDetail from "@/_components/SingleProductDetail";
import {
  ADDRESS,
  PRODUCT_ENDPOINT,
  RELATED_PRODUCTS_ENDPOINT,
} from "@/_Api Handlers/endpoints";
import { callApi } from "@/_Api Handlers/apiFunctions";
import { INSTANCE } from "@/_Api Handlers/apiConfig";
import { useRouter } from "next/navigation";
import { toastMessage } from "@/_utils/toastMessage";

const RELATED_PRODUCTS = [
  {
    imageUrl: "/images/cardImage.png",
    name: "Whole Grain bread",
    price: 40,
  },
  {
    imageUrl: "/images/cardImage.png",
    name: "Premium Cookies",
    price: 30,
  },
  {
    imageUrl: "/images/cardImage.png",
    name: "Premium Bread",
    price: 10,
  },
  {
    imageUrl: "/images/cardImage.png",
    name: "Premium Cookies",
    price: 10,
  },
];

const IMAGES = [
  { image: "/images/cardImage.png" },
  { image: "/images/bread.png" },
  { image: "/images/donut-hero.png" },
];

const SingleProductPage = ({ params }) => {
  // could be a specific product name
  const { productId } = params;
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const router = useRouter();

  useEffect(() => {
    callApi({
      endPoint: `${PRODUCT_ENDPOINT}${productId}`,
      method: "GET",
    })
      .then((res) => {
        setProduct(res.data);

        let params = {};

        res.data.category.forEach((item) => {
          params.category = item.name;
        });

        let urlParams = new URLSearchParams();
        res.data.category.forEach((item) => {
          urlParams.append("category", item.name);
        });

        const fullUrl = `${RELATED_PRODUCTS_ENDPOINT}?${urlParams.toString()}`;

        callApi({
          endPoint: fullUrl,
          method: "GET",
        })
          .then((res) => {
            // toastMessage("Product added successfully");
            setRelatedProducts(res?.data);
          })
          .catch((error) => {
            console.error("Error adding to cart:", error);
          });
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);
        toastMessage(error?.response?.data?.error, "error");
        router.push("/products");
      });

    callApi({
      endPoint: ADDRESS,
      method: "GET",
      instanceType: INSTANCE?.authorized,
    })
      .then((res) => {
        setSelectedAddress(
          res?.data?.results.find((ele) => ele.primary === true)
        );
      })
      .catch((error) => {
        console.error("Error getting address:", error);
      });
  }, []);

  return (
    <div>
      <SingleProductHeader />
      <div className="product-info py-[80px] max-w-[1400px] mx-auto">
        {/* carousel */}
        <ProductCarousel images={product?.images} />
        {/* <div className="product-carousel">Product carousel</div> */}
        <div className="single-product-detail">
          <SingleProductDetail
            product={product}
            selectedAddress={selectedAddress}
          />
        </div>
      </div>
      
      {/* related product section */}
      <h1 className="text-center uppercase font-bebas text-[36px] leading-[78px] text-customOrange">
        Related{" "}
        <span className="uppercase font-bebas text-[36px] leading-[78px] text-customBlack">
          Products
        </span>
      </h1>{" "}
      <div className="max-w-[1400px] mx-auto px-4 grid grid-cols-4 gap-4 justify-center flex-wrap">
        {relatedProducts?.map((curItem, index) => (
          <CardComponentOne key={index} data={curItem} showButtons={true} />
        ))}
      </div>
      {/* related product section */}
    </div>
  );
};

export default SingleProductPage;
