import React, { Fragment, useEffect, useRef, useState } from "react";
import { eyeIcon, trashIcon } from "../assets/Icons/Svg";
import { ITEMS_PER_PAGE, YYYY_MM_DD } from "../constant";
import {
  formatDate,
  getPrimaryAddress,
  renderSerialNumber,
} from "../utils/helpers";
import { useNavigate } from "react-router-dom";

const SingleCustomerRow = ({ item, handleActions, index, currentPage }) => {
  const {
    id,
    customer_type,
    name,
    order_count,
    contact_no,
    user,
    addresses,
    created_at,
    customer_id,
  } = item;

  // commented for future use
  const [showAll, setShowAll] = useState(false);
  const showAllRef = useRef();
  const initialAddresses = addresses.slice(0, 2);
  const additionalAddresses = showAll ? addresses : addresses.slice(0, 2);
  const navigate = useNavigate();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAllRef.current && !showAllRef.current.contains(event.target)) {
        setShowAll(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <tr className="text-center">
      {/* <td className="py-2 px-4 border">{id}</td> */}
      <td className="py-2 px-4 border bg-white">
        {renderSerialNumber(currentPage, ITEMS_PER_PAGE, index)}
      </td>
      <td className="py-2 px-4 border bg-white">
        {customer_id ? customer_id : "-"}
      </td>
      <td className="py-2 px-4 border capitalize bg-white">{name} </td>
      <td className="py-2 px-4 border capitalize bg-white">
        {created_at ? formatDate(created_at, YYYY_MM_DD) : "-"}
      </td>
      <td className="py-2 px-4 border capitalize bg-white">
        {user?.first_name || user?.last_name
          ? `${user?.first_name} ${user?.last_name}`
          : "-"}{" "}
      </td>

      <td className="py-2 px-4 border bg-white">
        <div className="contact-no">
          {contact_no}
          {user?.email && <div>{user?.email}</div>}
        </div>
      </td>

      {/* <td className="py-2 px-4 border">{addresses?.[0]?.address}</td> */}
      <td className="py-2 px-4 border bg-white">
        {/* commented for future use  */}
        <div>
          {initialAddresses?.length ? (
            <>
              <ul className="customer-list">
                {initialAddresses.map((item, idx) => (
                  <li key={idx} className="mb-2">
                    {item?.address}
                  </li>
                ))}
              </ul>
              <div className="view-more-button" ref={showAllRef}>
                {addresses.length > 2 && (
                  <button onClick={() => setShowAll(!showAll)}>
                    {showAll ? "Show Less" : "Show More"}
                  </button>
                )}
                {showAll && (
                  <div className="appended-data">
                    {additionalAddresses.map((item, idx) => (
                      <li key={idx}>{item?.address}</li>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            "-"
          )}
        </div>

        {/* {showAll && addresses.length > 2 && (
          <button onClick={() => setShowAll(false)}>Show Less</button>
        )} */}

        {/* {addresses?.length ? (
          <ul className="customer-list">
            {addresses.map((item, idx) => (
              <li key={idx}>{item?.address}</li>
            ))}
          </ul>
        ) : (
          "-"
        )} */}
      </td>

      <td
        className="py-2 px-4 border underline cursor-pointer bg-white"
        onClick={() =>
          navigate("/orders-management", {
            state: { user_id: user?.first_name },
          })
        }
      >
        {order_count &&
          `${order_count} ${order_count > 1 ? "Orders" : "Order"}`}
      </td>
      {/* commented for future use */}
      <td className="py-2 px-4 border bg-white">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              handleActions({ action: "view", viewItem: item });
            }}
            className="text-red-500 hover:text-red-700"
          >
            {eyeIcon}
          </button>
          <button
            onClick={() => {
              handleActions({ action: "delete", deleteItem: item });
            }}
            className="text-red-500 hover:text-red-700"
          >
            {trashIcon}
          </button>

        </div>
      </td>
    </tr>
  );
};

export default SingleCustomerRow;
