"use client";
import React, { useState, useEffect } from "react";
import CardComponentOne from "./_common/CardComponentOne";
import Link from "next/link";
import { callApi, METHODS } from "@/_Api Handlers/apiFunctions";
import {
  ADDRESS,
  FAVOURITE_ENDPOINT,
  GET_CART,
  PRODUCT_ENDPOINT,
} from "@/_Api Handlers/endpoints";
import { useRouter } from "next/navigation";
import { INSTANCE } from "@/_Api Handlers/apiConfig";
import { addItem } from "../../redux/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { setFavourites } from "../../redux/favouriteSlice";
import Cookies from "js-cookie";
import axios from "axios";
import Image from "next/image";
import PatternBread from '../../public/images/pattern-bread.png';

const DUMMY_DATA = [
  {
    imageUrl: "/images/cardImage.png",
    title: "Whole Grain bread",
    price: 40,
  },
  {
    imageUrl: "/images/cardImage.png",
    title: "Premium Cookies",
    price: 30,
  },
  {
    imageUrl: "/images/cardImage.png",
    title: "Premium Bread",
    price: 10,
  },
  {
    imageUrl: "/images/cardImage.png",
    title: "Premium Cookies",
    price: 10,
  },
];

const ProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

  const dispatch = useDispatch();

  let token;

  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  const favourites = useSelector((state) => state.favourites.favourites);

  useEffect(() => {
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

  useEffect(() => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    callApi({
      endPoint: PRODUCT_ENDPOINT,
      method: METHODS.get,
      params: { page: 1, status: "publish" },
    })
      .then((response) => {
        setProducts(response?.data?.results);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
      })
      .finally(() => { });

    // callApi({
    //   endPoint: GET_CART,
    //   method: "GET",
    //   instanceType: INSTANCE?.authorized,
    // })
    //   .then((res) => {
    //     // setCartID(res?.data?.id);
    //     if (res?.data?.items?.length > 0) {
    //       res.data.items.forEach((item) => {
    //         dispatch(addItem(item));
    //       });
    //     }
    //   })
    //   .catch((error) => {
    //     console.error("Error adding to cart:", error);
    //   });
    const payload = {
      delivery_address: selectedAddress?.id,
    };
    axios
      .post(`${baseURL}/cart/`, payload, {
        headers,
        withCredentials: true,
      })
      .then((res) => {
        if (res?.data?.items?.length > 0) {
          res.data.items.forEach((item) => {
            dispatch(addItem(item));
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching cart data:", error);
      });


    callApi({
      endPoint: FAVOURITE_ENDPOINT,
      method: METHODS.get,
      instanceType: INSTANCE?.authorized,
    })
      .then((response) => {
        // setFavouriteItems(response?.data?.results);
        dispatch(setFavourites(response?.data?.results));
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
      });
  }, [selectedAddress]);

  return (
    <>
      <section className="relative">
        <Image src={PatternBread} className="pattern-bread" />
        <div className="pt-10 pb-20 max-w-[1400px] mx-auto">
          <h5 className="text-eyebrowColor font-semibold text-[20px] mb-7 text-center">
            Popular Products
          </h5>
          <h4 className="uppercase text-4xl md:text-5xl font-bebas text-center mb-10">
            <span className="text-customOrange font-bebas">Delightful </span>
            Temptations
          </h4>{" "}
          {products?.length > 0 ? (
            <div className="grid grid-cols-4 gap-4 justify-center flex-wrap">
              {products?.map((curItem, index) => (
                <div>
                  <CardComponentOne
                    key={index}
                    data={curItem}
                    showButtons={true}
                    favourites={favourites}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-black font-bold text-xl flex justify-center">
              loading...
            </div>
          )}
          <div className="text-center mt-10">
            <Link
              href="/products"
              className="bg-btnBackground text-white px-6 py-3 rounded-full inline-block hover:bg-orange-700 transition duration-300"
            >
              View All Products →
            </Link>
          </div>
          {/* <button className="bg-red-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-red-700 transition duration-300">
        View All Products →
      </button> */}
        </div>
      </section>
    </>
  );
};

export default ProductsSection;
