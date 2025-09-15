import Image from "next/image";
import React from "react";
import PatternBun from '../../public/images/pattern-bun.png';

const OurStorySection = () => {
  return (
    <>
    <div className="relative">
    <Image src={PatternBun} className='pattern-bun' />
      <section className="container max-w-[1372px] mx-auto py-12 flex flex-col md:flex-row items-center justify-between">
        {/* Text Section */}
        <div className="md:w-1/2 space-y-4 text-left px-4">
          <h5 className="text-eyebrowColor font-semibold text-[20px] mb-12">Our Story</h5>
          <h2 className="text-4xl md:text-5xl font-bebas mb-8">
            BAKING TRADITION WITH <br /> A{" "}
            <span className="font-bebas text-customOrange">MODERN TWIST</span>
          </h2>
          <p className="text-greyText leading-relaxed mb-10">
            We blend time-honored baking traditions with modern creativity to
            craft delicious treats that bring joy to every bite. With a passion
            for creating freshly baked goods made from the finest ingredients,
            whether it's a warm loaf of bread, a delicate pastry, or a custom
            cake, each product is handmade with love and care.
          </p>
          <button className="bg-btnBackground text-white px-6 min-w-[180px] py-4 rounded-full hover:bg-orange-700 transition duration-300 text-uppercase tracking-widest font-semibold inline-flex justify-between items-center">
            ABOUT US <span>→</span>
          </button>
        </div>

        {/* Image Section */}
        <div className="md:w-1/2 mt-8 md:mt-0">
          <Image
            src="/images/sliced-bread.png"
            alt="Baked Goods"
            className="object-contain w-full"
            width={980}
            height={686}
          />
        </div>
      </section>
      </div>
    </>
  );
};

export default OurStorySection;
