import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const SupportPageHeader = () => {
  return (
    <div>
      <div>
        <div
          className="h-[200px] flex flex-col justify-center items-center text-center"
          style={{
            background: "linear-gradient(95.58deg, #FFFAF4 0%, #FFDC83 99.47%)",
          }}
        >
          <h1 className="uppercase font-bebas-neue text-[30px] font-bold leading-[78px] text-customBlack">
            Ask Us Anything{" "}
          </h1>
          <span className="uppercase font-bebas-neue text-[12px] font-bold leading-[78px] text-customBlack">
            Have any questions? We're here to assist you.
          </span>

          {/* add header section data here */}
          {/* search bar */}
          <div className="flex items-center border-2 rounded-full p-1 w-80">
            <input
              type="text"
              placeholder=""
              className="px-4 py-2 rounded-full outline-none text-gray-600 flex-grow"
            />
            <button className="w-20 bg-red-500 text-white px-6 py-2 rounded-full ml-2">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </div>
          {/* search bar */}
        </div>
      </div>
    </div>
  );
};

export default SupportPageHeader;
