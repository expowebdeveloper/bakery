import Image from "next/image";
import React from "react";

const CardComponentTwo = ({ imageUrl, title, description }) => {
  return (
    <>
      <div>
        <Image
          src={imageUrl}
          alt={"Premium Quality Standards"}
          className="mx-auto mb-4"
          width={100}
          height={50}
        />
        <h3 class="font-bold text-lg uppercase mb-2">{title} </h3>
        <p class="text-gray-600">{description}</p>
      </div>
    </>
  );
};

export default CardComponentTwo;
