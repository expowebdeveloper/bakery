import React from "react";

const ProductsPageHeader = () => {
  return (
    <div>
      <div className="h-[400px] flex flex-col justify-center items-center text-center bg-gradient-to-r from-[#FFFDF4] to-[#FFE8CC]">
        <h1 className="uppercase font-bebas-neue text-[50px] font-bold leading-[78px] text-customOrange">
          Discover Our{" "}
          <span className="uppercase font-bebas-neue text-[50px] font-bold leading-[78px] text-customBlack">
            Delicious categories,
          </span>
        </h1>
        <p>
          This adds a more inviting tone, encouraging exploration with a focus
          on the delicious offerings.
        </p>
        {/* add header section data here */}
      </div>
    </div>
  );
};

export default ProductsPageHeader;
