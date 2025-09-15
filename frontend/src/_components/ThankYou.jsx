import React from "react";
import TickIcon from "../../public/icons/tick";
import { handlePrintPdf } from "@/utils/helpers";
import { useRouter } from "next/navigation";

const ThankYou = ({ checkoutResponse }) => {
  const router= useRouter();
  return (
    <div className="border p-10 flex flex-col justify-center items-center space-y-6">
      <div>
        <TickIcon />
      </div>
      <div className="text-[#FF6363] font-bold text-lg">
        Thank you for ordering!
      </div>
      <div className="w-6/12 text-center">
        Your order has been placed successfully.
      </div>
      <div
        className="cursor-pointer text-blue-700"
        onClick={() => handlePrintPdf(checkoutResponse?.invoice_file)}
      >
        Download Invoice
      </div>
      <div className="border p-4 rounded-full bg-[#FFDC83] cursor-pointer" onClick={()=> router.push("/products")}>Continue Shopping</div>
    </div>
  );
};

export default ThankYou;
