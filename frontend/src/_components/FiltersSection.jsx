import React from "react";

const FiltersSection = ({
  handleSearch,
  handleSort,
  products,
  currentPage,
  totalProducts,
}) => {
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalProducts);
  return (
    <div className="flex justify-between items-center px-4">
      <p className="text-sm text-gray-600">{`Showing ${startIndex}-${endIndex} of ${totalProducts} results`}</p>

      <div className="flex space-x-2">
        {/* <select className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 bg-white">
          <option>Filters</option>
          <option>Category</option>
          <option>Price</option>
          <option>Brand</option>
        </select> */}

        <input
          type="text"
          className="border border-gray-300 px-1"
          placeholder="search"
          onChange={(e) => handleSearch(e)}
        />

        <select
          className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 bg-white"
          onChange={(e) => handleSort(e)}
        >
          <option value="popularity">Sort by: Popularity</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
};

export default FiltersSection;
