import React from "react";
import CommonButton from "./_common/CommonButton";
import { createPreview } from "@/_utils/helpers";
import { imagePlaceholder } from "@/assets/Icons/Svg";

const SingleCategory = ({ data, onCategoryClick, currentCategory }) => {
  const { name } = data;
  // const handleClick = () => {
  //   console.log("first");
  // };

  return (
    <>
      {/* <div
        className="flex flex-col items-center"
        onClick={() => onCategoryClick(value)}
      > */}
      <div
        className="flex flex-col items-center cursor-pointer"
        onClick={() => onCategoryClick(name)}
      >
        {
          data?.category_image ? (
            <img
              src={createPreview(data?.category_image)}
              className="w-[134px] h-[169px] rounded-[112px] border object-cover"
              alt="category-image"
            />
          ) : (
            <div className="imagePlaceholder">
              {imagePlaceholder}
            </div>
          )
        }
        <p
          className={`mt-2 text-capitalize text-center text-nowrap text-sm font-medium ${
            currentCategory === name ? "text-[#FF6363]" : "text-black"
          }`}
        >
          {name}
        </p>
      </div>
    </>
  );
};

export default SingleCategory;
