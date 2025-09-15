import React from "react";
import ContactSection from "@/_components/ContactSection";
import Footer from "@/_components/Footer";
import HomePageBanner from "@/_components/HomePageBanner";
import Navbar from "@/_components/Navbar";

const HomeLayout = ({ children }) => {
  return (
    <div>
      {" "}
      <Navbar />
      {children}
      <HomePageBanner />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default HomeLayout;
