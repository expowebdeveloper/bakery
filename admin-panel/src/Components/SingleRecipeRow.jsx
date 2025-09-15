import React from "react";
import {
  BUTTON_LOADER,
  editIcon,
  printIcon,
  trashIcon,
} from "../assets/Icons/Svg";
import { formatDate, listCategories, truncateString } from "../utils/helpers";
import { Tooltip } from "react-tooltip";
import Checkbox from "./Common/Checkbox";
import { STATUS, YYYY_MM_DD } from "../constant";
const STATUS_TO_TEXT = {
  true: "Published",
  false: "Draft",
};
const STATUS_TO_CLASS = {
  true: "text-green-500",
  false: "text-red-500",
};
const SingleRecipeRow = ({
  item,
  handleActions,
  handleSelectRecipe,
  selectedRecipes,
  handleRecipeStatusChange,
  handleServingEdit,
  printLoader,
  index,
}) => {
  // values in the figma name, id, quantity, reorder level, expiration date, last updated, notes:
  const {
    id,
    recipe_title,
    category,
    cook_time,
    is_active,
    preparation_time,
    serving_size,
    status,
    is_deleted,
  } = item;
  const handleStatusText = () => {
    if (status === "true" || status === "publish" || status === "Publish") {
      return "publish";
    } else if (status === "draft" || status === "Draft" || status === "false") {
      return "draft";
    }
  };
  return (
    <tr className="text-center">
      <td className="py-2 px-4 border bg-white">
        <Checkbox
          checked={selectedRecipes?.includes(id)}
          onClick={() => {
            handleSelectRecipe(id);
          }}
        />
      </td>
      <td className="py-2 px-4 border text-nowrap capitalize bg-white">
        {truncateString(recipe_title)}
      </td>
      <td className="py-2 px-4 border text-nowrap capitalize bg-white">
        {item?.created_at ? formatDate(item?.created_at, YYYY_MM_DD) : "-"}
      </td>
      <td className="py-2 px-4 border text-nowrap bg-white capitalize">
        {!category?.length ? "-" : listCategories(category)}
      </td>
      <td className="py-2 px-4 border text-nowrap bg-white">
        {preparation_time} {preparation_time > 1 ? "mins" : "min"}
      </td>
      <td className="py-2 px-4 border text-nowrap bg-white">
        {cook_time} {cook_time > 1 ? "mins" : "min"}
      </td>
      <td className="py-2 px-4 border text-nowrap bg-white">
        <div className="flex items-center space-x-2">
          <b>
            {serving_size} {serving_size > 1 ? "Servings" : "Serving"}
          </b>
          <div
            className="editIcon cursor-pointer"
            onClick={() => handleServingEdit(item)}
          >
            {editIcon}
          </div>
        </div>
      </td>
      <td
        className={`py-2 px-4 border text-nowrap bg-white ${STATUS_TO_CLASS?.[status]}`}
      >
        <div className="status-change">
          <select
            // value={handleStatusText()}
            value={is_active ? "publish" : "draft"}
            onChange={(e) => {
              handleRecipeStatusChange(item, e.target.value);
            }}
          >
            {STATUS?.map(({ label, value }, idx) => (
              <option key={idx} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </td>

      <td className="py-2 px-4 border space-x-2 flex text-nowrap items-center justify-center bg-white">
        {/* uncomment this  */}
        {
          !is_deleted ?
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={() =>
                handleActions({ action: "print", item: item, index: index })
              }
              data-tooltip-id="print-recipe"
              disabled={printLoader === index}
            >
              {printLoader === index ? BUTTON_LOADER : printIcon}
            </button>
            : ""
        }

        <Tooltip id="print-recipe" place="bottom" content="Print Recipe" />
        {
          !is_deleted ?
            <button
              onClick={() => handleActions({ action: "edit", id: id })}
              className="text-blue-500 hover:text-blue-700 "
            >
              {editIcon}
            </button>
            : ""
        }

        <button
          onClick={() => handleActions({ action: "delete", deleteItem: item })}
          className="text-red-500 hover:text-red-700"
        >
          {trashIcon}
        </button>

        {
          !is_deleted ?
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={() =>
                handleActions({ action: "printNutritionInfo", item: item })
              }
              data-tooltip-id="print-nutrition"
            >
              {printIcon}
            </button>
            : ""
        }

        <Tooltip
          id="print-nutrition"
          place="bottom"
          content="Print Nutrition Info"
        />
      </td>
    </tr>
  );
};

export default SingleRecipeRow;
