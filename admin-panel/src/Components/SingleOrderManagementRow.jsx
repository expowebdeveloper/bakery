import React from "react";
import {
  calculateItems,
  calculateItemSubtotal,
  createName,
  createPreview,
  formatDate,
} from "../utils/helpers";
import { eyeIcon, mailIcon, phoneIcon, rightArrow } from "../assets/Icons/Svg";
import CommonButton from "./Common/CommonButton";
import {
  ORDERS_STATUSES,
  UPDATE_STATUS_OPTIONS,
  YYYY_MM_DD,
} from "../constant";
import { useNavigate } from "react-router-dom";

const SingleOrderManagementRow = ({
  item,
  index,
  openIndex,
  handleToggle,
  handleStatusChange,
}) => {
  const navigate = useNavigate();
  const isOpen = openIndex === index;
  const PRODUCT_HEADINGS = [
    "S.no",
    "Name",
    "SKU",
    // "Variant",
    "Cost",
    "Quantity",
    "Total Amount",
  ];

  const returnButtonBasedOnStatus = () => {
    if (item?.status === ORDERS_STATUSES?.paymentPending) {
      return (
        <>
          <CommonButton
            text="Accept"
            className="!bg-[#FF6D2F] text-white !px-6 py-2 rounded"
            type="button"
            onClick={() => {
              handleStatusChange(UPDATE_STATUS_OPTIONS?.inProgress, item?.id);
            }}
          />
          <CommonButton
            text="Decline"
            className="bg-red-100 text-red-500 !px-4 py-2 rounded hover:bg-red-200 transition"
            type="button"
            onClick={() => {
              handleStatusChange(UPDATE_STATUS_OPTIONS?.rejected, item?.id);
            }}
          />
        </>
      );
    } else if (item?.status === ORDERS_STATUSES?.inTransit) {
      return (
        <CommonButton
          text="Mark Delivered"
          className="bg-red-100 text-red-500 !px-4 py-2 rounded hover:bg-red-200 transition"
          type="button"
          onClick={() => {
            handleStatusChange(UPDATE_STATUS_OPTIONS?.delivered, item?.id);
          }}
        />
      );
    } else if (item?.status === ORDERS_STATUSES?.inProgress) {
      return (
        <CommonButton
          text="In-Transit"
          className="bg-red-100 text-red-500 !px-4 py-2 rounded hover:bg-red-200 transition"
          type="button"
          onClick={() => {
            handleStatusChange(UPDATE_STATUS_OPTIONS?.inTransit, item?.id);
          }}
        />
      );
    } else if (
      item?.status === ORDERS_STATUSES?.rejected ||
      item?.status === ORDERS_STATUSES?.delivered
    ) {
      return <></>;
    } else {
      return (
        <>
          <CommonButton
            text="Accept"
            className="!bg-[#FF6D2F] text-white !px-6 py-2 rounded"
            type="button"
            onClick={() => {
              handleStatusChange(UPDATE_STATUS_OPTIONS?.inProgress, item?.id);
            }}
          />
          <CommonButton
            text="Decline"
            className="bg-red-100 text-red-500 !px-4 py-2 rounded hover:bg-red-200 transition"
            type="button"
            onClick={() => {
              handleStatusChange(UPDATE_STATUS_OPTIONS?.rejected, item?.id);
            }}
          />
        </>
      );
    }
  };
  const getItemStatus = () => {
    if (item?.status) {
      if (item?.status === "Payment pending") {
        return "Pending";
      } else {
        return item.status;
      }
    } else {
      return "-";
    }
  };
  return (
    <>
      <tr
        // onClick={() => handleToggle(index)}
        className="bg-white cursor-pointer"
      >
        <td className="p-3 w-[16.67%] text-center">
          <div className="text-[16px]">{item.order_id}</div>
          <div className="text-[#808080] text-[12px]">{item.dateTime}</div>
        </td>
        <td className="p-3 w-[16.67%] text-center capitalize">
          {createName(item?.user?.first_name, item?.user?.last_name)}
          <div>{``}</div>
        </td>
        <td className="p-3 w-[16.67%] text-center">
          <div>{formatDate(item?.created_at, YYYY_MM_DD)}</div>
        </td>
        <td className="p-3 w-[16.67%] text-center">
          <div>{calculateItems(item?.items)}</div>
        </td>
        <td className="p-3 w-[16.67%]">
          <div className="text-center">● {getItemStatus()}</div>
        </td>
        <td className="p-3 w-[16.67%] text-center">
          <div>{item?.invoice?.invoice_number}</div>
        </td>
        <td className="p-3 w-[16.67%] text-center">
          <div className="flex gap-2">
            <CommonButton
              icon={eyeIcon}
              className="text-blue-500 hover:text-blue-700"
              type="button"
              onClick={() =>
                navigate("/single-order", {
                  state: { id: item?.order_id },
                })
              }
            />
            <div className="flex space-x-2 whitespace-normal white-nowrap">{returnButtonBasedOnStatus()}</div>
            {/* <div
              className="text-sm underline white-nowrap"
              onClick={() => handleToggle(index)}
              
            >
              {isOpen ? "Hide details" : "View details"}
            </div> */}
          </div>
        </td>
        {/* <td className="w-[16.67%]">
          <div
                    className="flex space-x-2"
                    onClick={() =>
                      navigate("/single-order", {
                        state: { id: item?.order_id },
                      })
                    }
                  >
                    {rightArrow} Single order
                  </div>
        </td> */}
        {/* <td colSpan={7}>
          <table className="w-full custom_orders">
            <tbody>
              <tr>
              </tr>
              <tr>
                <td colSpan={12}>
                  <table className="w-full">
                    <tbody>
                      {isOpen && (
                        <td colSpan={5} className="p-3">
                          <div className="flex justify-between border-t pt-5 flex-col">
                            <div className="flex justify-between mb-4">
                              <div className="flex flex-col w-[50%]">
                                <div className="mb-4">
                                  <strong>#{item?.order_id}</strong>
                                  <p className="text-[12px]">
                                    Payment via Elavon Converge EU Gateway.
                                    Customer IP: 109.255.18.152
                                  </p>
                                </div>
                                <ul className="flex flex-col gap-3">
                                  <li className="flex gap-3">
                                    {mailIcon} {item?.email}
                                  </li>
                                  <li className="flex gap-3">
                                    {phoneIcon}
                                    {item?.contact_number}
                                  </li>
                                  <li className="flex gap-3">
                                    <b>Expected Delivery :</b>08/04/2024
                                  </li>
                                  <li className="flex gap-3">
                                    <b>Delivery Type :</b>Weekly
                                  </li>
                                </ul>
                              </div>
                              <div className="flex flex-col w-[50%]">
                                <div className="billing_Address">
                                  {item?.address && (
                                    <div>
                                      <b>Billing Address</b>
                                      <br />
                                      <span className="text-[14px]">
                                        {" "}
                                        {item?.address}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="shipping_Address">
                                  {item?.address && (
                                    <div>
                                      <b>Shipping Address</b>
                                      <br />
                                      <span className="text-[14px]">
                                        {" "}
                                        {item?.address}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <strong>Details:</strong>
                              <div></div>
                              <div></div>
                            </div>
                            <div className="products">
                              <strong>Products:</strong>
                              <div className="products-table">
                                <table className="w-full">
                                  <thead>
                                    {PRODUCT_HEADINGS?.map((th) => (
                                      <th className="text-start">{th}</th>
                                    ))}
                                  </thead>
                                  <tbody>
                                    {item?.items?.map((el, idx) => (
                                      <tr>
                                        <td className="w-[10%]">{idx + 1}</td>
                                        <td>
                                          <div className="name flex items-center space-x-2">
                                            <div className="picture">
                                              <img
                                                src={createPreview(
                                                  el?.product?.product
                                                    ?.images?.[0]?.image
                                                )}
                                              />
                                            </div>
                                            <div className="title">
                                              {el?.product?.product?.name}
                                            </div>
                                          </div>
                                        </td>
                                        <td className="uppercase">
                                          {el?.product?.inventory?.sku}
                                        </td>
                                        <td>{el?.price}</td>
                                        <td>{el?.quantity}</td>
                                        <td>{el?.price * el?.quantity}</td>
                                      </tr>
                                    ))}
                                    item subtotal
                                    <tr>
                                      <td
                                        colSpan={12}
                                        className="bg-[#f7f7f7] border-0"
                                      >
                                        <div className="item-subtotal text-end">
                                          <b className="w-[180px] inline-block text-start">
                                            Item Subtotal :
                                          </b>{" "}
                                          <span className="w-[100px] inline-block text-start">
                                            {item?.total_amount}
                                          </span>
                                        </div>
                                        <div className="item-subtotal text-end">
                                          <b className="w-[180px] inline-block text-start">
                                            Vat :{" "}
                                          </b>
                                          <span className="w-[100px] inline-block text-start">
                                            {Number(item?.final_amount) -
                                              Number(item?.total_with_vat)}
                                          </span>
                                        </div>
                                        <hr className="mb-2 mt-2" />
                                        <div className="item-subtotal text-end">
                                          <b className="w-[180px] inline-block text-start">
                                            Total :
                                          </b>
                                          <span className="w-[100px] inline-block text-start">
                                            {item?.final_amount}{" "}
                                          </span>
                                        </div>
                                        <div className="item-subtotal">Total :{calculateItemSubtotal(item?.items)*el.product.vat} </div>
                                        <div className="buttons flex items-center space-x-4">
                                          <div className="notify-out-of-stock">
                                            <CommonButton
                                              text="Notify Out Of Stock"
                                              className="orange_button"
                                              type="button"
                                              onClick={() => {
                                                handleStatusChange("", item?.id);
                                              }}
                                            />
                                          </div>
                                          <div className="mark-deleivered">
                                            <CommonButton
                                              text="Mark Delivered"
                                              className="orange_button"
                                              type="button"
                                              onClick={() => {
                                                handleStatusChange(
                                                  UPDATE_STATUS_OPTIONS?.delivered,
                                                  item?.id
                                                );
                                              }}
                                            />
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </td>
                      )}
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td> */}
      </tr>
    </>
  );
};

export default SingleOrderManagementRow;
