import React from "react";
import CommonButton from "./Common/CommonButton";
import { draftIcon, publishIcon } from "../assets/Icons/Svg";

const DiscountSideSection = ({ children, btnLoaders }) => {
  return (
    <div className="flex flex-col gap-4 w-[300px] sticky top-[0px] discount-rightside ">
      <div className="flex gap-4 discount-btn-wrapper">
        <CommonButton
          text="Draft"
          name="draft"
          className="px-4 py-2 bg-[#E4E4E4] rounded-lg orange_btn"
          type="submit"
          icon={draftIcon}
          loader={btnLoaders?.draft}
          disabled={btnLoaders?.saveDiscount || btnLoaders?.draft}
        />
        <CommonButton
          text="Save Discount"
          name="saveDiscount"
          className="px-4 py-2 bg-[#E4E4E4] rounded-lg orange_btn"
          type="submit"
          icon={publishIcon}
          loader={btnLoaders?.saveDiscount}
          disabled={btnLoaders?.saveDiscount || btnLoaders?.draft}
        />
      </div>
      {/* for summary section */}
      {children}
    </div>
  );
};

export default DiscountSideSection;
