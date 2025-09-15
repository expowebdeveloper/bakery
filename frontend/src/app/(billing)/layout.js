import Footer from "@/_components/Footer";
import Navbar from "@/_components/Navbar";
import React from "react";

const BillingLayout = ({ children }) => {
  return (
    <div>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
};

export default BillingLayout;
