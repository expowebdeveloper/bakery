"use client";
import React, { useState, useEffect, useCallback } from "react";
import SingleCategory from "./SingleCategory";
import FiltersSection from "./FiltersSection";
import CardComponentOne from "./_common/CardComponentOne";
import CommonButton from "./_common/CommonButton";
import Link from "next/link";
import { callApi, METHODS } from "@/_Api Handlers/apiFunctions";
import {
  PRODUCT_ENDPOINT,
  CATEGORIES_ENDPOINT,
} from "@/_Api Handlers/endpoints";
import { usePathname, useRouter } from "next/navigation";
import PageLoader from "@/loaders/PageLoader";

const DUMMY_CATEGORIES = [
  {
    img: "/images/category-image.png",
    name: "Bread",
    value: "",
  },
  {
    img: "/images/category-image.png",
    name: "Cookies",
    value: "cookies",
  },
  {
    img: "/images/category-image.png",
    name: "Macron",
    value: "macron",
  },
  {
    img: "/images/category-image.png",
    name: "Pretzel",
    value: "pretzel",
  },
  {
    img: "/images/category-image.png",
    name: "Cupcakes",
    value: "cupcakes",
  },
  {
    img: "/images/category-image.png",
    name: "Cakes",
    value: "cakes",
  },
];
const DUMMY_PRODUCTS = [
  {
    imageUrl: "/images/cardImage.png",
    title: "Whole Grain bread",
    price: 40,
    id: 1,
  },
  {
    imageUrl: "/images/cardImage.png",
    title: "Premium Cookies",
    price: 30,
    id: 2,
  },
  {
    imageUrl: "/images/cardImage.png",
    title: "Premium Bread",
    price: 10,
    id: 3,
  },
  {
    imageUrl: "/images/cardImage.png",
    title: "Premium Cookies",
    price: 10,
    id: 4,
  },
];

const AVAILABILITY_FILTERS = [
  {
    label: "In Stock",
    value: "in_stock",
  },
  {
    label: "Out of Stock",
    value: "out_of_stock",
  },
]
const CategoriesListing = () => {
  const pathname = usePathname();
  const [pageLoader, setPageLoader] = useState(false);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [hideButton, setHideButton] = useState(false);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popularity");
  const [totalProducts, setTotalProducts] = useState(null);
  const [openSection, setOpenSection] = useState(null);
  const [sideFilters, setSideFilters] = useState({
    availability: false,
    category: false,
    price_min: false,
    price_max: false,
  });
  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 0,
  });
  const handlePriceRangeChange = (type, value) => {
    setPriceRange({
      ...priceRange,
      [type]: value,
    });
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };


  const router = useRouter();

  const onCategoryClick = (selectedCategory) => {
    setCurrentCategory(selectedCategory);
  };

  // const CategoryDataToMap = categories.slice(4,(products.length - 1))

  useEffect(() => {
    setPageLoader((prev) => true);
    callApi({
      endPoint: PRODUCT_ENDPOINT,
      method: METHODS.get,
      params: {
        page: page,
        category: currentCategory,
        search: search,
        sort_by: sort,
        status: "publish",
        ...sideFilters,
      },
    })
      .then((response) => {
        // setProducts((prev) => [...prev, ...(response?.data?.results || [])]);
        setProducts(response?.data?.results);
        setTotalProducts(response?.data?.total_products);
        if (response?.data?.next === null) {
          setHideButton(true);
        }
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
      })
      .finally(() => {
        setPageLoader((prev) => false);
      });
  }, [page, currentCategory, search, sort, sideFilters]);

  useEffect(() => {
    callApi({
      endPoint: CATEGORIES_ENDPOINT,
      method: METHODS.get,
      params: { page: 1 },
    })
      .then((response) => {
        setCategories(response?.data?.results);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
      })
      .finally(() => { });
  }, []);

  function debounce(func, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(null, args);
      }, delay);
    };
  }

  const handleLoadMore = () => {
    setPage(page + 1);
  };

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearch(value);
    }, 500),
    []
  );

  const handleSearch = (e) => {
    debouncedSearch(e.target.value);
  };

  const handleSort = (e) => {
    setSort(e.target.value);
    setPage(1);
    setProducts([]);
  };
  const handleSideFilterChange = (filter, value) => {
    if (filter === "price") {
      const updatedFilters = {
        ...sideFilters,
        price_min: priceRange.min,
        price_max: priceRange.max,
      }
      setSideFilters(updatedFilters);
    } else {
      setSideFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
    }
  };

  return (
    <>
      {pageLoader ? <PageLoader /> : ""}
      <div className="bg-[#FFFDF4] pt-10">

        {/* categories listing */}
        {
          pathname !== "/" ? (
            <>
              <h1 className="text-center uppercase font-bebas-neue text-[25px] font-bold leading-[78px] text-customOrange">
                Select Your{" "}
                <span className="uppercase font-bebas-neue text-[25px] font-bold leading-[78px] text-customBlack">
                  Designed categories,
                </span>
              </h1>{" "}
              <div className="flex justify-center items-center space-x-4 overflow-x-auto">
                {categories?.map((cat, index) => (
                  <SingleCategory
                    data={cat}
                    key={index}
                    onCategoryClick={onCategoryClick}
                    currentCategory={currentCategory}
                  />
                ))}
              </div>
            </>

          ) : ""
        }

        <div className="container mx-auto px-6 pt-10">
          <div className="flex gap-4">
            {
              pathname !== "/" ?
                <div className="flex-none w-[30%]">
                  <div className='blog-sidecard p-5 bg-white border-4 border-[#eee] mb-5'>
                    <button
                      onClick={() => toggleSection('availability')}
                      className="w-full flex justify-between items-center text-[22px] font-bold mb-3"
                    >
                      <span>Availability</span>
                      <span>{openSection === 'availability' ? '-' : '+'}</span>
                    </button>

                    {openSection === 'availability' ?
                      <>
                        {AVAILABILITY_FILTERS.map((filter, index) => (
                          <div className="flex gap-2 mb-2">
                            <input type="checkbox" id={`availability${filter.value}`} value={filter.value} onChange={(e) => handleSideFilterChange("availability", e.target.value)} />
                            <label htmlFor={`availability${filter.value}`} className="text-black">{filter.label}</label>
                          </div>
                        ))}
                      </>
                      : ""}
                  </div>
                  {
                    categories?.length ?
                      <div className='blog-sidecard p-5 bg-white border-4 border-[#eee] mb-5'>
                        <button
                          onClick={() => toggleSection('category')}
                          className="w-full flex justify-between items-center text-[22px] font-bold mb-3"
                        >
                          <span>Category</span>
                          <span>{openSection === 'category' ? '-' : '+'}</span>
                        </button>
                        {openSection === 'category' ?
                          <>
                            {categories?.map((cat, index) => (
                              <div className="flex gap-2 mb-2">
                                <input type="checkbox" id={`category${cat.name}`} value={cat.name} onChange={(e) => handleSideFilterChange("category", e.target.value)} />
                                <label htmlFor={`category${cat.name}`} className="text-black">{cat.name}</label>
                              </div>
                            ))}
                          </>
                          : ""}
                      </div>
                      : ""
                  }

                  <div className='blog-sidecard p-5 bg-white border-4 border-[#eee] mb-5'>
                    <button
                      onClick={() => toggleSection('price')}
                      className="w-full flex justify-between items-center text-[22px] font-bold mb-3"
                    >
                      <span>Price</span>
                      <span>{openSection === 'price' ? '-' : '+'}</span>
                    </button>
                    {openSection === 'price' ?
                      <>
                        <div className="grid grid-cols-2 gap-5">
                          <div className="w-full flex-none">
                            <label className="text-black mb-1 block">From $</label>
                            <input type="text" onChange={(e) => handlePriceRangeChange("min", e.target.value)} value={priceRange.min} className="p-3 w-full border border-[#ccc] text-black" placeholder="From" />
                          </div>
                          <div className="w-full flex-none">
                            <label className="text-black mb-1 block">To $</label>
                            <input type="text" onChange={(e) => handlePriceRangeChange("max", e.target.value)} value={priceRange.max} className="p-3 w-full border border-[#ccc] text-black" placeholder="To" />
                          </div>
                          <button className="bg-customOrange text-white px-4 py-2 rounded-full" onClick={() => handleSideFilterChange("price")}>Apply</button>
                        </div>
                      </>
                      : ""}
                  </div>
                </div>
                : ""
            }

            <div>
              {/* categories listing */}
              {/* filters */}
              <div className="mb-4 max-w-[1400px] mx-auto">
                <FiltersSection
                  handleSearch={handleSearch}
                  handleSort={handleSort}
                  products={products}
                  currentPage={page}
                  totalProducts={totalProducts}
                />
              </div>
              {/* filters */}
              {/* product listing */}
              <div className="grid grid-cols-3 gap-4 justify-center flex-wrap max-w-[1400px] mx-auto mb-10">
                {products?.length > 0 ? (
                  products?.map((curItem, index) => (
                    <div onClick={() => router.push(`/products/${curItem.id}`)}>
                      <CardComponentOne key={index} data={curItem} showButtons={true} />
                    </div>
                  ))
                ) : (
                  <div>No items</div>
                )}
              </div>
              {/* product listing */}
              <div className="flex justify-center">
                {!hideButton && (
                  <CommonButton
                    className="text-center bg-red-500 text-white px-6 py-2 rounded-full ml-2"
                    text="Load More"
                    type="button"
                    onClick={handleLoadMore}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>

  );
};

export default CategoriesListing;
