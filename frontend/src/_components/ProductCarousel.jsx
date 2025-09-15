"use client";
import { createPreview } from "@/_utils/helpers";
import { useState } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const ProductCarousel = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images?.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images?.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex items-center flex-col justify-center gap-4 mt-10 flex-1">
      {/* Thumbnails */}

      {/* Main image with navigation */}
      <div className="relative w-full">
        <button
          onClick={handlePrev}
          className="absolute top-1/2 left-[20px] w-[40px] h-[40px] rounded-full shadow-[0px_0px_6.5px_0px_rgba(0,0,0,0.25)] text-[30px] transform -translate-y-1/2 bg-white text-black flex justify-center items-center shadow-md hover:bg-gray-200"
        >
          &#8249;
        </button>
        <img
          src={createPreview(images?.[activeIndex]?.image)}
          alt={`Slide ${activeIndex}`}
          className="w-full object-contain rounded-lg shadow-md h-[500px]"
        />
        <button
          onClick={handleNext}
          className="absolute top-1/2 w-[40px] h-[40px] rounded-full shadow-[0px_0px_6.5px_0px_rgba(0,0,0,0.25)] right-[20px] text-[30px] transform -translate-y-1/2 bg-white flex justify-center items-center text-black shadow-md hover:bg-gray-200"
        >
          &#8250;
        </button>
      </div>
      <div className="flex gap-4">
        {images?.length && images?.map((image, index) => (
          <img
            key={index}
            src={createPreview(image?.image)}
            alt={`Thumbnail ${index}`}
            onClick={() => setActiveIndex(index)}
            className={`w-20 h-20 object-cover rounded-md border-2 cursor-pointer ${
              index === activeIndex ? "border-gray-800" : "border-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  )
};

export default ProductCarousel;
