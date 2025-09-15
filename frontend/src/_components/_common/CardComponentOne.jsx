"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { callApi, METHODS } from "@/_Api Handlers/apiFunctions";
import { successType, toastMessage } from "@/_utils/toastMessage";
import { CART, FAVOURITE_ENDPOINT } from "@/_Api Handlers/endpoints";
import { createPreview } from "@/_utils/helpers";
import Heart from "../../../public/icons/heart";
import Cart from "../../../public/icons/cart";
import Eye from "../../../public/icons/eye";
import { useDispatch } from "react-redux";
import { addItem } from "../../../redux/cartSlice";
import { INSTANCE } from "@/_Api Handlers/apiConfig";
import axios from "axios";
import { imagePlaceholder } from "@/assets/Icons/Svg";

const CardComponentOne = ({ data, favourites, showButtons = false }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  // commented for future use
  // const { images, name } = data;
  const { title, imageUrl, price, name } = data;

  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();
  let token = localStorage.getItem("token");

  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

  // const isProductsPage = pathName === "/products";
  console.log(pathname, "this is pathname")

  useEffect(() => {
    if (favourites?.some((fav) => fav.product.id === data.id)) {
      setIsFavorite(true);
    }
  }, [favourites, data.id]);

  const handleFavorite = (event, data) => {
    event.stopPropagation();

    if (isFavorite) {
      const payload = {
        product: data.id,
      };
      callApi({
        endPoint: FAVOURITE_ENDPOINT,
        method: METHODS.delete,
        instanceType: INSTANCE?.authorized,
        payload: payload,
      })
        .then((res) => {
          setIsFavorite(false);
          toastMessage("Removed from favorites", "success");
        })
        .catch((error) => {
          console.error("Error removing from favorites:", error);
          toastMessage("Failed to remove from favorites", "error");
        });
    } else {
      const payload = {
        product: data.id,
      };
      callApi({
        endPoint: FAVOURITE_ENDPOINT,
        method: METHODS.post,
        instanceType: INSTANCE?.authorized,
        payload: payload,
      })
        .then((res) => {
          setIsFavorite(true);
          toastMessage("Added to favorites", "success");
        })
        .catch((error) => {
          console.error("Error adding to favorites:", error);
          toastMessage("Failed to add to favorites", "error");
        });
    }
  };

  const handleCart = async (event, payload) => {
    console.log(payload, "this is payload");
    event.stopPropagation();
    // callApi({
    //   endPoint: CART,
    //   method: "POST",
    //   instanceType: INSTANCE?.authorized,
    //   payload: {
    //     product_variant: payload?.product_detail?.variants?.[0]?.inventory?.id,
    //     quantity: 1,
    //   },
    //   // withCredentials:true
    // })
    //   .then((res) => {
    //     if (res.data.error) {
    //       toastMessage(res.data.error, "error");
    //       return;
    //     }
    //     dispatch(addItem(res.data));
    //     toastMessage("Product added successfully", "success");
    //   })
    //   .catch((error) => {
    //     console.error("Error adding to cart:", error);
    //     toastMessage(error?.response?.data?.error, "error");
    //   });

    // const productVariantId =
    //     payload?.product_detail?.variants?.[0]?.inventory?.id;


    const productVariantId =
      payload?.status === "available"
        ? payload?.product_detail?.variants?.find(
          (ele) => ele?.inventory?.total_quantity > 0
        )?.inventory?.id
        : payload?.product_detail?.variants?.[0]?.inventory?.id;

    const apiUrl = `${baseURL}/cart/item/`;

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const response = await axios.post(
        apiUrl,
        {
          product_variant: productVariantId,
          quantity: 1,
        },
        {
          headers,
          withCredentials: true,
        }
      );

      if (response.data.error) {
        toastMessage(response.data.error, "error");
        return;
      }

      dispatch(addItem(response.data));
      toastMessage("Product added successfully", "success");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toastMessage(
        error?.response?.data?.error || "An error occurred",
        "error"
      );
    }
  };

  const capitalizeName = (str) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());
  console.log(createPreview(data?.feature_image?.image),"preview image")

  return (
    <div className="group relative">
      {" "}
      {/* <div className="max-w-xs rounded overflow-hidden border border-gray-200 pt-12 pb-7 rounded-[26px]">
        <Image
          src={
            data?.feature_image
              ? createPreview(data?.feature_image?.image)
              : "/images/cardImage.png"
          }
          alt="card-image"at
          width={280}
          height={202}
        />

        <div className="flex space-x-4 px-4 justify-between">
          <p className="text-xl mb-0">{name}</p>
          <p className="font-bold text-redPrimary text-xl mb-0">
            ${data?.product_detail?.inventory?.regular_price}
          </p>

        </div>
      </div> */}
      <div className="w-full">
        <div className="">
          {/* {favorites.map((favorite) => ( */}
          <div className="gap-2 mb-2 border min-h-64 h-full w-56 rounded-lg flex flex-col justify-between p-4 cursor-pointer w-full productcard bg-white">
            <div className="h-[250px] productImage">
              {
                data?.feature_image?.image ? (
                  <img
                    src={createPreview(data?.feature_image?.image)}
                    alt={"image"}
                    className="h-[220px] w-full object-contain"
                  />
                ) : (
                  imagePlaceholder
                )
              }
            </div>
            <div className="flex flex items-center flex-col gap-[10px]">
              <div className="text-black font-semibold text-lg">
                {capitalizeName(name)}
              </div>
              <div className="font-bold text-[30px]" style={{ color: "#FF7723" }}>
                ${data?.product_detail?.inventory?.regular_price || price}
              </div>
            </div>
          </div>
          {/* ))} */}
        </div>
      </div>
      {showButtons && (
        <div
          className="absolute inset-0 flex items-center justify-center gap-2 
  opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/40 backdrop-blur-[14px] rounded-lg"
        >
          {token && (
            pathname !== "/" ? (
              <button
                className={`p-3 text-white rounded-full ${isFavorite ? "bg-white" : "bg-customOrange"
                  }`}
                onClick={(e) => handleFavorite(e, data)}
              >
                <Heart fill={isFavorite ? "red" : "white"} />
              </button>
            ) : ""
          )}

          <button
            className="p-3 bg-customOrange text-white rounded-full"
            onClick={(e) => handleCart(e, data)}
          >
            <Cart fill="white" />
          </button>
          <button
            className="p-3 bg-customOrange text-white rounded-full"
            onClick={() => router.push(`/products/${data.id}`)}
          >
            <Eye fill="white" />
          </button>
        </div>
      )}
      {/* {isProductsPage && (
        <div
          className="absolute inset-0 flex items-center justify-center gap-2 
opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/80 rounded-[26px]"
        >
          <button
            className="p-3 bg-red-500 text-white rounded-lg"
            onClick={(event) => handleCart(event, data)}
          >
            ADD TO CART
          </button>
        </div>
      )} */}
    </div>
  );
};

export default CardComponentOne;
