import CommonButton from "@/_components/_common/CommonButton";
import SummarySection from "@/_components/SummarySection";
import React from "react";

const Cart = () => {
  return (
    <div>
      {/* <SummarySection /> */}
      <div className="subtotal flex items-center space-x-4">Subtotal $1600</div>
      <div className="shipping-charges  flex items-center space-x-4">
        Shipping charges $50.00
      </div>
      <div className="total  flex items-center space-x-4">Total $1650.00</div>
      <CommonButton text="Confirm Order" className="bg-#FF6363" />
    </div>
  );
};

export default Cart;
