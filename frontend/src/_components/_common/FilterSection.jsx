"use client";
import React, { Fragment, useState } from "react";
import { searchIcon } from "../../assets/Icons/Svg";

const FilterSection = ({
  filterFields,
  handleFilterChange,
  className = "filterInput",
  children,
  filters,
}) => {
  const [searchInput, setSearchInput] = useState("");

  return (
    <div className="filtersSection flex items-center gap-4">
      {filterFields?.map(
        ({ type, filterName, defaultOption, options, placeholder }, idx) => (
          <div className="selection-pre">
            <Fragment key={idx}>
              <div className="filters">
                {type === "select" && (
                  <select
                    className={className}
                    onChange={(e) =>
                      handleFilterChange(filterName, e.target.value)
                    }
                    value={filters[filterName]}
                  >
                    <option value="" selected hidden disabled>
                      {defaultOption}
                    </option>
                    {options?.map(({ value, label }, idx) => (
                      <option key={idx} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {type === "search" && (
                <div className="flex searchbox ms-auto">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="search-input border px-4 me-4 rounded-lg"
                    placeholder={placeholder}
                  />
                  <div
                    className="searchIcon bg-red-400 rounded-lg w-[35px] h-[35px] flex justify-center items-center text-white cursor-pointer"
                    onClick={() => handleFilterChange(filterName, searchInput)}
                  >
                    <span className="w-[20px] h-[20px] inline-block">{searchIcon}</span>
                  </div>
                </div>
              )}
            </Fragment>
          </div>
        )
      )}
      <div className="filter-buttons flex ms-auto">{children}</div>
    </div>
  );
};

export default FilterSection;
