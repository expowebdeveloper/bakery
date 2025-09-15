
import React from "react";
import Image from "next/image";
import BannerImage from '../../public/images/Banner-image1.png';
import PatternLeave from '../../public/images/pattern-leave.png';
import SearchBar from "./SearchBar";
import Link from "next/link";
// import donutImg from '../../public/images/donut-img.png'

const HeaderSection = () => {
  return (
    <div className="hero-section bg-gradient-to-r from-[#FFFDF4] to-[#FFE8CC] pt-[144px] pb-20 relative">
      {/* <Image src={donutImg} /> */}
      <div className="grid grid-cols-2 max-w-[1400px] mx-auto items-center">
        <div>
          <h3 className="eyebrow-text text-customOrange font-semibold text-![14px] mb-2">100% Genuine Products</h3>
          <h1 className="font-bebas text-[78px] leading-[78px] mb-7">
            Freshly <span className="text-customOrange font-bebas">Baked Delights,</span><br />
            <span className="font-bebas">Crafted with <span className="font-bebas">Love 🥐❤️</span></span>
          </h1>
          <p className="max-w-[1000px] mx-auto text-[17px] pl-3 border-s border-[#484848] text-[#484848] mb-8">From warm, buttery croissants to decadent cakes, experience the joy of freshly baked goods made daily in our bakery. Indulge in the finest treats, made with the freshest ingredients just for you.</p>
          {/* add header section data here */}
          {/* <SearchBar /> */}
          <Link href={"/products"} className="inline-block px-[18px] py-[9px] bg-customOrange text-white font-medium border-0">Shop Now</Link>
        </div>
        <div>
          <Image src={BannerImage} />
        </div>
      </div>
      <Image src={PatternLeave} className="pattern-leave" />
    </div>
  );
};

export default HeaderSection;
