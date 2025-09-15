import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import authImage from "../assets/images/authImage.png";

const PublicLayout = () => {
  const isToken = localStorage.getItem("token");

  return (
    <div className="login-container h-screen flex">
      <>
        {/* Section 1 */}
        <div
          className="section1 w-1/2 p-6"
          style={{
            backgroundImage: `url(${authImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Background image is applied here */}
        </div>

        {/* Section 2 */}
        <div className="section2 w-1/2 p-6 flex items-center justify-center">
          {!isToken ? <Outlet /> : <Navigate to="/dashboard" />}{" "}
        </div>
      </>
    </div>
  );
};

export default PublicLayout;
