"use client";
import React from "react";
import Image from "next/image";

const CategoryHeadingSection = ({ imageUrl, width, height, title }) => {
  return (
    <div>
      <Image src={imageUrl} alt="categoryImage" width={width} height={height} />
      <div className="title">{title}</div>
    </div>
  );
};

export default CategoryHeadingSection;
