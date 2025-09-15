import React from "react";
import CardComponentTwo from "./_common/CardComponentTwo";
const DUMMY_DATA = [
  {
    imageUrl: "/images/homepageCardImage1.png",
    title: "Premium Quality Standards",
    description:
      "Emphasize the bakery’s commitment to maintaining the highest quality standards in all products. This could include quality control processes, certifications, and adherence to industry standards.",
  },
  {
    imageUrl: "/images/homepageCardImage2.png",
    title: "Wholesale Baking Solutions",
    description:
      "Highlight the bakery’s ability to provide large-scale, consistent, and high-quality baked goods to businesses. This could include supplying restaurants, cafes, hotels, and grocery stores.",
  },
  {
    imageUrl: "/images/homepageCardImage3.png",
    title: "RELIABLE SUPPLY CHAIN & DELIVERY",
    description:
      "Focus on the bakery’s commitment to reliability, timely deliveries, and maintaining a strong supply chain. This is crucial for businesses that depend on consistent inventory.",
  },
];
const HomePageSectionTwo = () => {
  return (
    <>
      <div class="container mx-auto py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {DUMMY_DATA?.map(({ title, imageUrl, description }, index) => (
            <CardComponentTwo
              key={index}
              title={title}
              imageUrl={imageUrl}
              description={description}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default HomePageSectionTwo;
