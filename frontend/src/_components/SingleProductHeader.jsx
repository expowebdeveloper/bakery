import React from "react";

const SingleProductHeader = () => {
  return (
    <div
      className="h-[100px] flex items-center text-[20px] bg-gradient-to-r from-[#FFFDF4] to-[#FFE8CC]"
    >
      <div className="container mx-auto px-6">
        {`Product Category > Premium Cookies`}
      </div>
    </div>
  );
};

export default SingleProductHeader;
