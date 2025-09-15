"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CommonButton from "./_common/CommonButton";
import { logout } from "@/_Api Handlers/apiFunctions";
import { toastMessage } from "@/_utils/toastMessage";
import { DEFAULT_ERROR_MESSAGE } from "@/_constants/constant";
import Cookies from "js-cookie";
import { manageUserAuthorization } from "@/_utils/helpers";
import { useRouter } from "next/navigation";
import Cart from "../../public/icons/cart";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../../redux/cartSlice";
import { closeIcon, navbarSearchIcon, searchIcon } from "@/assets/Icons/Svg";
import SearchBar from "./SearchBar";

const NAV_LINKS = [
  // {
  //   label: "Home",
  //   href: "/",
  // },
  {
    label: "About Us",
    href: "/about",
  },
  {
    label: "Shop",
    href: "/products",
  },
  {
    label: "Blog",
    href: "/blog",
  },
  {
    label: "Support",
    href: "/support",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
];
const Navbar = () => {
  const [showSearchSection, setShowSearchSection] = useState(false);
  const [token, setToken] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const firstName = Cookies.get("firstName");
  const lastName = Cookies.get("lastName");
  const name = `${firstName} ${lastName}`;
  const dispatch = useDispatch();

  useEffect(() => {
    const tokenCookie = Cookies.get("token");
    setToken(tokenCookie);
  }, [])
  const toggleSearchSection = () => {
    setShowSearchSection(!showSearchSection);
  }

  // const handleLogout = () => {
  //   const payload = {};
  //   logout(payload)
  //     .then((res) => {
  //       toastMessage("Logged out successfully");
  //       manageUserAuthorization({ action: "remove" });
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
  //     });
  // };

  const cartItemsCount = useSelector((state) => state?.cart?.items?.length);

  const handleLogout = () => {
    // const values = {
    //   token: token,
    // };
    // logout(values)
    //   .then((res) => {
    //     manageUserAuthorization({ action: "remove" });
    //     router.push("/login");
    //   })
    //   .catch((err) => {
    //     toastMessage(
    //       err?.response?.data?.non_field_errors?.[0] || DEFAULT_ERROR_MESSAGE
    //     );
    //   });

    manageUserAuthorization({ action: "remove" });
    setToken(null);
    router.push("/login");
    dispatch(clearCart());
    // toastMessage("Logged out successfully");
  };

  return (
    <>
      <div
        className="w-full shadow-md bg-gradient-to-r from-[#FFFDF4] to-[#FFE8CC]"
      >
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          {/* Logo Section */}
          <div className="text-xl font-bold">
            <Link href="/">Logo</Link>
          </div>
          {/* Navigation Links Section */}
          <div className="space-x-6 hidden md:flex">
            {NAV_LINKS?.map(({ label, href }, index) => (
              <Link
                key={index}
                href={href}
                className={`text-gray-700 hover:text-gray-900 ${pathname === href ? "active-nav-link" : ""
                  }`}
              >
                {label}
              </Link>
            ))}
          </div>


          {/* Login and Signup Section */}
          {token ? (
            <div className="logout flex gap-4 text-black cursor-pointer">
              <p onClick={() => router.push('/profile')}>{name}</p>
              <CommonButton type="button" text="logout" onClick={handleLogout} />
              <div className="relative" onClick={() => router.push(`/billing`)}>
                <Cart fill="#000000" />
                <div className="absolute bottom-4 left-5 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                  {cartItemsCount}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-x-4 flex">
              <div className="searchIcon cursor-pointer" onClick={toggleSearchSection}>
                {navbarSearchIcon}
              </div>
              <Link className="text-gray-700 hover:text-gray-900" href="/login">
                Login{" "}
              </Link>
              {/* <Link href="/client-signup-registration" className="text-gray-700 hover:text-gray-900">
                Signup{" "}
              </Link> */}
              <div className="relative cursor-pointer" onClick={() => router.push(`/billing`)}>
                <Cart fill="#000000" />
                <div className="absolute bottom-4 left-5 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                  {cartItemsCount}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={showSearchSection ? "searchSection active-search" : "searchSection"}>
        <button className="close-zipcode" onClick={toggleSearchSection}>
          {closeIcon}
        </button>
        <div className="search">
          <SearchBar setShowSearchSection={setShowSearchSection} />
        </div>
      </div>
    </>
  );
};

export default Navbar;
