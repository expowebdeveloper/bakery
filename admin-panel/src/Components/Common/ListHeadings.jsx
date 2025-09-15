import React, { Fragment } from "react";
import Checkbox from "./Checkbox";
import { useLocation } from "react-router-dom";

const ListHeadings = ({
  columns,
  rowClassName = "bg-orange-50",
  columnClassName = "py-4 px-4 bg-[#FFEFE7] w-[16.67%] white-nowrap",
  onCheckboxChange,
  checked,
}) => {
  const location = useLocation();
  const pathname = location?.pathname;
  return (
    <thead>
      <tr className={rowClassName}>
        {columns.map((hd) => (
          <Fragment>
            {hd === "checkbox" ? (
              <th className={`${columnClassName} ${pathname === "/products" ? "text-left" : ""}`}>
                <Checkbox onClick={onCheckboxChange} checked={checked} />
              </th>
            ) : (
              <th className={`${columnClassName} ${pathname === "/products" ? "text-left" :""} ${location?.pathname === "/orders-management" && hd === "Action" ? "text-left" : ""}`}>
                {hd}
              </th>
            )}
          </Fragment>
        ))}
      </tr>
    </thead>
  );
};

export default ListHeadings;
