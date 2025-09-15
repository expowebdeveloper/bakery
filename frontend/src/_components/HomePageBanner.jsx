import Image from "next/image";
import Link from "next/link";
import React from "react";
import bakerFryPan from '../../public/images/bakery-frypan.png'

const HomePageBanner = () => {
  return (
    <>
      <div className="bg-greenBg bg-cover bg-center pt-[88px]">
        <div className="text-white max-w-[900px] mx-auto relative pb-[100px] border border-white/30">
          <Image src={bakerFryPan} className="absolute bottom-0 left-1/2 -translate-x-1/2 z-[2] max-w-[600px] w-full" />
          <h3 className="text-[88px] font-gloock text-white text-right pr-10 relative z-[1]">The Sweetest</h3>
          <div className="flex justify-between items-center  relative z-[3]">
            <div>
              <h3 className="text-[88px] font-gloock text-left text-white">Heaven</h3>
              <h3 className="text-[88px] font-gloock text-left text-white pl-10">for</h3>
            </div>
            <div className="-mr-[180px]">
              <p className="text-[18px] text-normal text-[#EAEAEA] max-w-[320px] mb-6">A delightful treat that combines the comforting charms of freshly baked cookies with the rich, luxurious and mouthwatering filling.</p>
              <Link href={'/products'} className="inline-block text-[18px] underline text-white">Get more details</Link>
            </div>
          </div>
          <h3 className="text-[88px] font-gloock text-white text-right  relative z-[3]">freshly baked</h3>
        </div>
      </div>
    </>
  );
};

export default HomePageBanner;
