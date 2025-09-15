import ContactSection from "@/_components/ContactSection";
import Footer from "@/_components/Footer";
import Navbar from "@/_components/Navbar";
import React from "react";

const Support = ({ children, SupportHeader }) => {
  return (
    <div>
      <Navbar />
      {SupportHeader}
      {children}
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Support;
