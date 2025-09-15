import Link from "next/link";
import React from "react";

const ContactSection = () => {
  return (
    <>
      <div className="bg-white py-8 px-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">
            STAY TUNED <span className="text-red-500">WITH US</span>
          </h2>
          <p className="text-gray-600 mt-2">
            Join our newsletter to get the latest updates on new products,
            exclusive offers, and delicious recipes straight to your inbox. Be
            the first to know about special events and seasonal treats!
          </p>
          <Link
            href="tel:+46812345678"
            className="mt-4 inline-block font-bold text-black underline"
          >
            Call us at +46 8 123 456 78
          </Link>
        </div>
        {/* <div className="relative">
          <div className="absolute top-0 right-0 text-gray-200 text-6xl font-bold opacity-10 -z-10">
            @Bakery
          </div>
          <div className="border-2 border-black rounded-full p-6 flex items-center justify-center">
            <span className="font-bold text-sm tracking-widest">
              NEWSLETTER
            </span>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default ContactSection;
