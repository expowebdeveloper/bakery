import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";

const PrivateLayout = ({ curItem }) => {
  const isToken = localStorage.getItem("token");
  const currentRole = localStorage.getItem("role");
  const isAllowed = curItem.roles.includes(currentRole);
  const ROLE_TO_REDIRECT = {
    accountant: "/orders-management",
    admin: "/dashboard",
    stock_manager: "/products",
  };

  return (
    <div>
      {""}
      {isToken && <Sidebar />}
      {isToken && <Header />}
      <div className="outlet">
        {isToken ? (
          isAllowed ? (
            <Outlet />
          ) : (
            <Navigate to={ROLE_TO_REDIRECT?.[currentRole]} />
          )
        ) : (
          <Navigate to="/login" />
        )}
      </div>
    </div>
  );
};

export default PrivateLayout;
