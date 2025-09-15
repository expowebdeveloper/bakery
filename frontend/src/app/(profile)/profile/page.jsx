"use client";
import React, { useEffect, useState } from "react";
import Location from "../../../../public/icons/location";
import OrderCart from "../../../../public/icons/orderCart";
import Heart from "../../../../public/icons/heart";
import CreditCard from "../../../../public/icons/card";
import Setting from "../../../../public/icons/setting";
import ProfileOrder from "@/_components/ProfileOrder";
import ProfileFavourite from "@/_components/ProfileFavourite";
import ProfilePayment from "@/_components/ProfilePayment";
import ProfileAddress from "@/_components/ProfileAddress";
import ProfileSetting from "@/_components/ProfileSetting";
import Sidebar from "@/_components/Sidebar";
import {
  ADDRESS,
  FAVOURITE_ENDPOINT,
  ORDER_ENDPOINT,
  PROFILE_UPDATE,
  UPDATE_PASSWORD,
} from "@/_Api Handlers/endpoints";
import { callApi, METHODS } from "@/_Api Handlers/apiFunctions";
import { INSTANCE } from "@/_Api Handlers/apiConfig";

const Profile = () => {
  const [currentCategory, setCurrentCategory] = useState("orders");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [favouriteItems, setFavouriteItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [sideBarItems, setSideBarItems] = useState("orders");
  const [profileData, setProfileData] = useState();
  const [ordersData, setOrdersData] = useState([]);
  const [sidebarItemId, setSidebarItemId] = useState();

  const handleCategoryChange = (category) => {
    setCurrentCategory(category);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSideBarItem = (item, id) => {
    setSideBarItems(item);
    setSidebarItemId(id);
  };

  const handleEditProfile = () => {
    handleSideBarItem("editProfile");
    toggleSidebar();
  };

  const handleChangePassword = () => {
    handleSideBarItem("changePassword");
    // toggleSidebar();
  };

  const handleProfileData = () => {
    callApi({
      endPoint: PROFILE_UPDATE,
      method: "GET",
      instanceType: INSTANCE?.authorized,
    })
      .then((res) => {
        setProfileData(res?.data);
      })
      .catch((error) => {
        console.error("Error getting address:", error);
      });
  };

  const getAddress  = () => {
    callApi({
      endPoint: ADDRESS,
      method: "GET",
      instanceType: INSTANCE?.authorized,
    })
      .then((res) => {
        setAddresses(res?.data?.results);
      })
      .catch((error) => {
        console.error("Error getting address:", error);
      });
  }

  useEffect(() => {
    callApi({
      endPoint: FAVOURITE_ENDPOINT,
      method: METHODS.get,
      instanceType: INSTANCE?.authorized,
    })
      .then((response) => {
        setFavouriteItems(response?.data?.results);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
      });

      getAddress();

    callApi({
      endPoint: ORDER_ENDPOINT,
      method: "GET",
      instanceType: INSTANCE?.authorized,
    })
      .then((res) => {
        setOrdersData(res?.data?.results);
      })
      .catch((error) => {
        console.error("Error getting address:", error);
      });

    handleProfileData();
  }, []);

  const handleSetFavouriteItems = () => {
    callApi({
      endPoint: FAVOURITE_ENDPOINT,
      method: METHODS.get,
      instanceType: INSTANCE?.authorized,
    })
      .then((response) => {
        setFavouriteItems(response?.data?.results);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
      });
  };

  const handleDeleteAddress = (id) => {
    setAddresses((prev) => prev?.filter((address) => address.id !== id));
  };

  const renderContent = () => {
    switch (currentCategory) {
      case "orders":
        return (
          <ProfileOrder
            toggleSidebar={toggleSidebar}
            handleSideBarItem={handleSideBarItem}
            ordersData={ordersData}
          />
        );
      case "favorites":
        return (
          <ProfileFavourite
            favorites={favouriteItems}
            handleSetFavouriteItems={handleSetFavouriteItems}
          />
        );
      case "payments":
        return <ProfilePayment />;
      case "addresses":
        return (
          <ProfileAddress
            addresses={addresses}
            handleDeleteAddress={handleDeleteAddress}
            getAddress={getAddress}
          />
        );
      case "settings":
        return <ProfileSetting profileData={profileData} handleProfileData={handleProfileData}/>;
      default:
        return (
          <ProfileOrder
            toggleSidebar={toggleSidebar}
            handleSideBarItem={handleSideBarItem}
            ordersData={ordersData}
          />
        );
    }
  };

  return (
    <>
      <div className="bg-white px-12 py-20">
        {/* navbar */}
        <div className="flex justify-between px-6">
          <div>
            <h2 className="text-black text-xl font-semibold mb-2">{`${profileData?.user?.first_name} ${profileData?.user?.last_name}`}</h2>
            <div className="flex gap-4">
              <p className="text-black">{profileData?.contact_no}</p>
              <p className="text-black">{profileData?.user?.email}</p>
            </div>
          </div>
          <div>
            <button
              className="bg-[#FF6D2F] text-white py-2 px-4 rounded-md"
              onClick={handleEditProfile}
            >
              Edit Profile
            </button>
          </div>
        </div>
        {/* main section */}
        <div className="flex p-6 gap-6">
          <div className="w-[250px] bg-[#f8f9fa] p-5 border border-[#ddd] rounded-lg flex-none">
            <ul className="space-y-6">
              <li
                className={`flex gap-2 items-center cursor-pointer ${
                  currentCategory === "orders"
                    ? "bg-[#FF6D2F] text-white p-2 rounded-full"
                    : ""
                }`}
                onClick={() => handleCategoryChange("orders")}
              >
                <div
                  className={`p-2 rounded-full bg-[#D9D9D9] ${
                    currentCategory === "orders" ? "bg-white" : ""
                  }`}
                >
                  <OrderCart />
                </div>
                <div
                  className={`text-[#808080] no-underline ${
                    currentCategory === "orders" ? "text-white" : ""
                  }`}
                >
                  Orders
                </div>
              </li>
              <li
                className={`flex gap-2 items-center cursor-pointer ${
                  currentCategory === "favorites"
                    ? "bg-[#FF6D2F] text-white p-2 rounded-full"
                    : ""
                }`}
                onClick={() => handleCategoryChange("favorites")}
              >
                <div
                  className={`p-2 rounded-full bg-[#D9D9D9] ${
                    currentCategory === "favorites" ? "bg-white" : ""
                  }`}
                >
                  <Heart />
                </div>
                <div
                  className={`text-[#808080] no-underline ${
                    currentCategory === "favorites" ? "text-white" : ""
                  }`}
                >
                  Favorites
                </div>
              </li>
              <li
                className={`flex gap-2 items-center cursor-pointer ${
                  currentCategory === "payments"
                    ? "bg-[#FF6D2F] text-white p-2 rounded-full"
                    : ""
                }`}
                onClick={() => handleCategoryChange("payments")}
              >
                <div
                  className={`p-2 rounded-full bg-[#D9D9D9] ${
                    currentCategory === "payments" ? "bg-white" : ""
                  }`}
                >
                  <CreditCard />
                </div>
                <div
                  className={`text-[#808080] no-underline ${
                    currentCategory === "payments" ? "text-white" : ""
                  }`}
                >
                  Invoices
                </div>
              </li>
              <li
                className={`flex gap-2 items-center cursor-pointer ${
                  currentCategory === "addresses"
                    ? "bg-[#FF6D2F] text-white p-2 rounded-full"
                    : ""
                }`}
                onClick={() => handleCategoryChange("addresses")}
              >
                <div
                  className={`p-2 rounded-full bg-[#D9D9D9] ${
                    currentCategory === "addresses" ? "bg-white" : ""
                  }`}
                >
                  <Location />
                </div>
                <div
                  className={`text-[#808080] no-underline ${
                    currentCategory === "addresses" ? "text-white" : ""
                  }`}
                >
                  Addresses
                </div>
              </li>
              <li
                className={`flex gap-2 items-center cursor-pointer ${
                  currentCategory === "settings"
                    ? "bg-[#FF6D2F] text-white p-2 rounded-full"
                    : ""
                }`}
                onClick={() => handleCategoryChange("settings")}
              >
                <div
                  className={`p-2 rounded-full bg-[#D9D9D9] ${
                    currentCategory === "settings" ? "bg-white" : ""
                  }`}
                >
                  <Setting />
                </div>
                <div
                  href="#"
                  className={`text-[#808080] no-underline ${
                    currentCategory === "settings" ? "text-white" : ""
                  }`}
                >
                  Settings
                </div>
              </li>
            </ul>
          </div>
          {/* right side section */}
          {renderContent()}
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        sideBarItems={sideBarItems}
        handleChangePassword={handleChangePassword}
        profileData={profileData}
        sidebarItemId={sidebarItemId}
        ordersData={ordersData}
        handleProfileData={handleProfileData}
      />
    </>
  );
};

export default Profile;
