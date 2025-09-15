import React, { Fragment, useState } from "react";
import { searchIcon } from "../../assets/Icons/Svg";

const FilterSection = ({
  filterFields,
  handleFilterChange,
  className = "filterInput",
  children,
  filters,
  isRecipe = false,
  isPayment = false,
  searchInput,
  setSearchInput,
}) => {
  const sortableFields = [
    "name",
    "status",
    "cost",
    "quantity",
    "order_id",
    "preparation_time",
    "cook_time",
    "serving_size",
    "recipe_title",
    "code",
    "is_active",
    "coupon_type",
    "user__first_name",
    "expiry_date",
  ];

  return (
    <div className="filtersSection">
      <div className="flex">
        {filterFields?.map(
          ({ type, filterName, defaultOption, options, placeholder }, idx) => (
            <div className="selection-pre" key={idx}>
              <div className="filters">
                {type === "select" && (
                  <select
                    className={className}
                    onChange={(e) =>
                      handleFilterChange(filterName, e.target.value)
                    }
                    value={
                      filterName === "action"
                        ? ""
                        : filterName === "sort_by"
                        ? sortableFields.includes(filters?.["sort_by"])
                          ? filters?.["sort"] === "asc"
                            ? filters?.["sort_by"]
                            : filters?.["sort"] === "desc"
                            ? `-${filters?.["sort_by"]}`
                            : filters?.["sort_by"]
                          : filters?.["sort_by"] || filters?.["sort"]
                        : filters?.[filterName]
                    }
                  >
                    {isRecipe && filterName === "status" ? (
                      <>
                        <option value="all">All</option>
                        <option value="publish">Published</option>
                        <option value="draft">Draft</option>
                        <option value="trash">Trash</option>
                      </>
                    ) : isPayment && filterName === "status" ? (
                      <>
                        <option value="">All</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </>
                    ) : (
                      <>
                        <option value="" selected hidden disabled>
                          {defaultOption}
                        </option>
                        {options?.map(({ value, label }, idx) => (
                          <option key={idx} value={value}>
                            {label}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                )}
              </div>
              {type === "search" && (
                <div className="flex searchbox ms-auto mr-2">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="search-input"
                    placeholder={placeholder}
                  />
                  <div
                    className="searchIcon bg-red-400 rounded-lg py-1 px-2 cursor-pointer"
                    onClick={() => handleFilterChange(filterName, searchInput)}
                  >
                    {searchIcon}
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>
      <div className="filter-buttons flex xl:ms-auto">{children}</div>
    </div>
  );
};

export default FilterSection;
