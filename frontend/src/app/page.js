import Head from "next/head";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HeaderSection from "@/_components/HeaderSection";
import OurStorySection from "@/_components/OurStorySection";
import ProductsSection from "@/_components/ProductsSection";
import SignatureDelightBanner from "@/_components/SignatureDelightBanner";
import LimitedTimeOffers from "@/_components/LimitedTimeOffers";
import Navbar from "@/_components/Navbar";
import HomePageBanner from "@/_components/HomePageBanner";
import Footer from "@/_components/Footer";
import InformationCard from "@/_components/InformationCard";
import BrandInfoCard from "@/_components/BrandInfoCard";
import CustomerReviews from "@/_components/CustomerReviews";
import CategoriesListing from "@/_components/CategoriesListing";
import BlogCards from "@/_components/BlogCards";

export default function Home() {
  return (
    <div className="home-page">
      {/* <HomePageHeader /> */}
      {/* <HomePageSectionTwo /> */}
      <Navbar />
      <HeaderSection />
      <BrandInfoCard />
      <OurStorySection />
      <SignatureDelightBanner />
      {/* <ProductsSection /> */}
      <CategoriesListing/>
      <LimitedTimeOffers />
      <HomePageBanner />
      <CustomerReviews />
      <BlogCards />
      <InformationCard />
      <Footer />
    </div>
  );
}