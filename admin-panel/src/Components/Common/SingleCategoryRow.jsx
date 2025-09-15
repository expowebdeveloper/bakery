import React, { Fragment, useEffect, useState } from "react";
import { ITEMS_PER_PAGE, YYYY_MM_DD } from "../../constant";
import { editIcon, imageUploadIcon, trashIcon } from "../../assets/Icons/Svg";
import {
  createPreview,
  formatDate,
  renderSerialNumber,
  truncateString,
} from "../../utils/helpers";
import ImageUploadSection from "../../Form Fields/ImageUploadSection";
import Checkbox from "./Checkbox";

const SingleCategoryRow = ({
  item,
  currentPage,
  index,
  handleActions,
  handleSelectedCategories,
  selectedItems,
  handleSelectItems,
}) => {
  const {
    name,
    description,
    id,
    slug,
    product_count,
    category_image,
    subcategories,
    created_at,
  } = item;
  console.log(item, "this is item");
  const { categories, subCategories } = selectedItems;
  return (
    <>
      <tr className="text-center">
        <td className="text-center rounded-tl-[10px] rounded-bl-[10px] bg-white">
          <Checkbox
            checked={categories?.includes(id)}
            onClick={() => {
              handleSelectItems(id, "category");
            }}
          />
        </td>
        <td className="py-2 px-4 border text-center text-center bg-white">
          {category_image ? (
            <div className="image-display mx-auto">
              <img
                src={createPreview(category_image)}
                className="w-[30px] h-[30px] object-cover rounded-2"
              />
            </div>
          ) : (
            imageUploadIcon
          )}
        </td>
        <td className="py-2 px-4 border capitalize bg-white">
          {name ? name : "-"}
        </td>
        <td className="py-2 px-4 border bg-white">{slug ? slug : "-"}</td>
        <td className="py-2 px-4 border bg-white">
          {" "}
          {truncateString(description)}
        </td>
        <td className="py-2 px-4 border bg-white">
          {created_at ? formatDate(created_at, YYYY_MM_DD) : "-"}
        </td>
        <td className="py-2 px-4 border bg-white">
          {product_count ? product_count : "0"}
        </td>
        <td className="py-2 px-4 border space-x-2 bg-white">
          <div className="payment-actions flex gap-2">
            <button
              onClick={() =>
                handleActions({
                  action: "edit",
                  editItem: item,
                  type: "category",
                })
              }
              className="text-blue-500 hover:text-blue-700"
            >
              {editIcon}
            </button>
            <button
              onClick={() =>
                handleActions({
                  action: "delete",
                  deleteItem: item,
                  type: "category",
                })
              }
              className="text-red-500 hover:text-red-700"
            >
              {trashIcon}
            </button>
          </div>
        </td>
      </tr>

      {/* for listing subcategories */}
      {subcategories?.length > 0
        ? subcategories.map((subCategory, subCategoryIndex) => (
            <Fragment key={subCategoryIndex}>
              <tr className="text-center">
                <td className="text-center rounded-tl-[10px] rounded-bl-[10px]">
                  <Checkbox
                    checked={subCategories?.includes(subCategory?.id)}
                    onClick={() => {
                      handleSelectItems(subCategory?.id, "subcategory");
                    }}
                  />
                </td>
                <td className="py-2 px-4 border text-center">
                  {subCategory?.category_image ? (
                    <div className="image-display mx-auto">
                      <img
                        src={createPreview(subCategory?.category_image)}
                        className="w-[30px] h-[30px] object-cover rounded-2"
                      />
                    </div>
                  ) : (
                    imageUploadIcon
                  )}
                </td>
                <td className="py-2 px-4 border capitalize">
                  {" "}
                  • {subCategory?.name}
                </td>
                <td className="py-2 px-4 border">
                  {subCategory?.slug ? subCategory?.slug : "-"}
                </td>
                <td className="py-2 px-4 border">
                  {truncateString(subCategory?.description)}
                </td>
                <td className="py-2 px-4 border">
                  {subCategory?.created_at
                    ? formatDate(created_at, YYYY_MM_DD)
                    : "-"}
                </td>
                <td className="py-2 px-4 border">
                  {subCategory?.product_count ? subCategory?.product_count : 0}
                </td>
                <td className="py-2 px-4 border space-x-2">
                  <button
                    onClick={() =>
                      handleActions({
                        action: "edit",
                        editItem: subCategory,
                        type: "subcategory",
                      })
                    }
                    className="text-blue-500 hover:text-blue-700"
                  >
                    {editIcon}
                  </button>
                  <button
                    onClick={() =>
                      handleActions({
                        action: "delete",
                        deleteItem: item,
                        type: "subcategory",
                      })
                    }
                    className="text-red-500 hover:text-red-700"
                  >
                    {trashIcon}
                  </button>
                </td>
              </tr>
            </Fragment>
          ))
        : ""}
    </>
  );
};

export default SingleCategoryRow;
const data = [
  {
    name: "sadasdsa",
    description: "sasdasdasd",
    id: 3,
    slug: "sdfsf",
    product_count: 23,
    category_image: "/isdfkdfdsmkfsf",
    subCategories: [
      {
        name: "sadasdsa",
        description: "sasdasdasd",
        id: 3,
        slug: "sdfsf",
        product_count: 23,
        category_image: "/isdfkdfdsmkfsf",
      },
    ],
  },
];
