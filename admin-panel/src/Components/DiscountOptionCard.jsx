import React from "react";
import CommonButton from "./Common/CommonButton";
import { crossIcon } from "../assets/Icons/Svg";

const DiscountOptionCard = ({ option, handleRedirection }) => {
  const { title, description, buttonText, icon } = option;
  return (
    <div>
      <div className="bg-[#F0F0F0] rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-base font-medium text-[#3E3232]">{title}</h3>
        <p className="text-[#000000] text-sm mb-4">{description}</p>
        <CommonButton
          text={buttonText}
          className="px-4 py-2 rounded-md bg-[#FF6D2F] text-[#FFFFFF] flex items-center gap-4"
          type="button"
          onClick={() => {
            handleRedirection(title);
          }}
          icon={icon}
        />
      </div>
    </div>
  );
};

export default DiscountOptionCard;
