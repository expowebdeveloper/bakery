import React from "react";

const SignatureDelightBanner = () => {
  return (
    <>
      <div className="bg-[url('/images/signature-delight-banner.png')] bg-cover bg-center flex items-center justify-center text-center py-[170px]">
        <div className="text-white max-w-[860px] mx-auto">
          {" "}
          {/* Add text color for contrast */}
          <h2 className="font-gabarito font-normal text-[65px] leading-[78px] text-center mb-12 text-[#0A0A0A]">
            Dive deep into our Bakery’s Signature Delights
          </h2>
          <p className="font-gabarito font-normal text-[20px] text-center text-[#595959]">
            Indulge in a symphony of flavors as we present our bakery’s signature delights, masterfully crafted to awaken your senses and leave you longing for every irresistible bite.
          </p>
        </div>
      </div>
      
    </>
  );
};

export default SignatureDelightBanner;
