'use client';
import { INSTANCE } from "@/_Api Handlers/apiConfig";
import { callApi, METHODS } from "@/_Api Handlers/apiFunctions";
import { FAVOURITE_ENDPOINT } from "@/_Api Handlers/endpoints";
import { createPreview } from "@/_utils/helpers";
import { toastMessage } from "@/_utils/toastMessage";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import Cart from "../../public/icons/cart";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addItem } from "../../redux/cartSlice";
import Eye from "../../public/icons/eye";
const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

const ProfileFavourite = ({ favorites, handleSetFavouriteItems }) => {
  let token = localStorage.getItem("token");
  const dispatch = useDispatch();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(null);
  const menuRef = useRef(null);

  const handleMenuToggle = (id) => {
    setMenuOpen((prev) => (prev === id ? null : id));
  };

  const handleRemove = (id) => {
    const payload = { product: id };
    callApi({
      endPoint: FAVOURITE_ENDPOINT,
      method: METHODS.delete,
      instanceType: INSTANCE?.authorized,
      payload: payload,
    })
      .then(() => {
        toastMessage("Removed from favorites", "success");
        handleSetFavouriteItems();
      })
      .catch((error) => {
        console.error("Error removing from favorites:", error);
        toastMessage("Failed to remove from favorites", "error");
      });
  };

  const capitalizeName = (str) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(null); // Close the menu if clicked outside
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleCart = async (event, payload) => {
    console.log(payload, "this is favorite item")
    event.stopPropagation();
    const productVariantId =
      payload?.product?.status === "available"
        ? payload?.product?.product_detail?.variants?.find(
          (ele) => ele?.inventory?.total_quantity > 0
        )?.inventory?.id
        : payload?.product?.product_detail?.variants?.[0]?.inventory?.id;

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
      );
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-black font-extrabold mb-2">Favourites</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {favorites.length > 0 ? (
          favorites.map((favorite) => (
            <div
              key={favorite.id}
              // onClick={(e) => {
              //   router.push(`/products/${favorite?.product?.id}`);
              // }}
              className="gap-2 mb-2 border min-h-[256px] w-56 relative rounded-lg flex flex-col justify-between cursor-pointer"
            >
              <div className="h-4/5 relative px-4 pt-4">
                <div className="actionIcons">
                  <div
                    className="absolute inset-0 flex items-center justify-center w-full h-full gap-2 
  opacity-0 hover:opacity-100 transition-opacity duration-300 bg-white/40 backdrop-blur-[14px] rounded-lg z-[2]"
                  >
                    <button
                      className="p-3 bg-red-500 text-white rounded-full"
                      onClick={(e) => handleCart(e, favorite)}
                    >
                      <Cart fill="white" />
                    </button>
                    <button
                      className="p-3 bg-red-500 text-white rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/products/${favorite?.product?.id}`);
                      }}
                    >
                      <Eye fill="white" />
                    </button>
                  </div>
                </div>
                <img
                  src={createPreview(favorite?.product?.feature_image?.image)}
                  alt={favorite?.product?.name}
                  className=""
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="text-black font-semibold text-sm">
                    {capitalizeName(favorite?.product?.name)}
                  </div>
                  <div className="font-semibold" style={{ color: "#FF2F2F" }}>
                    {favorite?.product?.product_detail?.inventory?.regular_price}
                  </div>
                </div>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuToggle(favorite.id);
                    }}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    &#x22EE;
                  </button>
                  {menuOpen === favorite.id && (
                    <div className="absolute right-0 top-6 bg-white border shadow-md rounded-md z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(favorite?.product?.id);
                        }}
                        className="px-4 py-2 text-sm text-red-500 hover:bg-gray-100 w-full text-left"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div>No items in favourites</div>
        )}
      </div>
    </div>
  );
};

export default ProfileFavourite;
