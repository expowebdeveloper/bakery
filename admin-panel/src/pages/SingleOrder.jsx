import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { T } from "../utils/languageTranslator";
import { ORDERS_ENDPOINT, SINGLE_ORDER_ENDPOINT } from "../api/endpoints";
import { makeApiRequest, METHODS } from "../api/apiFunctions";
import { createName, createPreview, extractAfterCom } from "../utils/helpers";
import { mailIcon, phoneIcon, userSvg } from "../assets/Icons/Svg";
import { successType, toastMessage } from "../utils/toastMessage";
import useLoader from "../hooks/useLoader";
import PageLoader from "../loaders/PageLoader";
import CommonButton from "../Components/Common/CommonButton";
import {
  DEFAULT_ERROR_MESSAGE,
  ORDERS_STATUSES,
  PRICE_UNIT,
  UPDATE_STATUS_OPTIONS,
} from "../constant";
import ChangeStatusModal from "../Components/Common/ChangeStatusModal";
import BackButton from "../Components/Common/BackButton";
const PRODUCT_HEADINGS = [
  "S.no",
  "Name",
  "SKU",
  "Cost",
  "Quantity",
  "Total Amount",
];
const STATUS_TO_TEXT = {
  payment_pending: "Payment pending",
  delivered: "Delivered",
  in_progress: "In-Progress",
  rejected: "Rejected",
  canceled: "Canceled",
  in_transit: "In-Transit",
};

const SingleOrder = () => {
  const navigate = useNavigate();
  const [statusChangeInfo, setStatusChangeInfo] = useState({
    show: false,
    id: null,
    status: "",
  });
  const { pageLoader, setPageLoader } = useLoader();
  const location = useLocation();
  const id = location?.state?.id;
  const prevRoute = location?.state?.prevRoute;
  const [singleOrder, setSingleOrder] = useState([]);
  const [buttonLoader, setButtonLoader] = useState(false);
  useEffect(() => {
    if (id) {
      getDataSingleOrder();
    } else {
      toastMessage("Invalid id");
      navigate("/orders-management");
    }
  }, [id]);
  const getDataSingleOrder = () => {
    setPageLoader((prev) => true);
    makeApiRequest({
      endPoint: `${SINGLE_ORDER_ENDPOINT}${id}/`,
      method: METHODS.get,
    })
      .then((res) => {
        setSingleOrder(res?.data);
      })
      .catch((err) => {
        toastMessage("Invalid id");
        navigate("/orders-management");
        console.log(err);
      })
      .finally(() => {
        setPageLoader((prev) => false);
      });
  };
  const handleStatusChange = (status, id) => {
    setStatusChangeInfo({
      show: true,
      id: id,
      status: status,
    });
  };
  const changeStatus = () => {
    setButtonLoader((prev) => true);
    const payload = {
      status: statusChangeInfo?.status,
    };
    makeApiRequest({
      endPoint: ORDERS_ENDPOINT,
      update_id: statusChangeInfo?.id,
      payload,
      method: METHODS?.patch,
    })
      .then((res) => {
        toastMessage("Status Updated Successfully", successType);
        getDataSingleOrder();
      })
      .catch((err) => {
        toastMessage(err?.response?.data || DEFAULT_ERROR_MESSAGE);
      })
      .finally(() => {
        setButtonLoader((prev) => false);
        handleStatusCancel();
      });
  };
  const handleStatusCancel = () => {
    setStatusChangeInfo({
      id: null,
      status: "",
      show: false,
    });
  };
  console.log(singleOrder, "singleOrder");
  console.log(singleOrder, "shss")

  const returnButtonBasedOnStatus = () => {
    if (singleOrder?.status === ORDERS_STATUSES?.paymentPending) {
      return (
        <>
          <CommonButton
            text="Accept"
            className="!bg-[#FF6D2F] text-white !px-6 py-2 rounded"
            type="button"
            onClick={() => {
              handleStatusChange(
                UPDATE_STATUS_OPTIONS?.inProgress,
                singleOrder?.id
              );
            }}
          />
          <CommonButton
            text="Decline"
            className="bg-red-100 text-red-500 !px-4 py-2 rounded hover:bg-red-200 transition"
            type="button"
            onClick={() => {
              handleStatusChange(
                UPDATE_STATUS_OPTIONS?.rejected,
                singleOrder?.id
              );
            }}
          />
        </>
      );
    } else if (singleOrder?.status === ORDERS_STATUSES?.inTransit) {
      return (
        <CommonButton
          text="Mark Delivered"
          className="bg-red-100 text-red-500 !px-4 py-2 rounded hover:bg-red-200 transition"
          type="button"
          onClick={() => {
            handleStatusChange(
              UPDATE_STATUS_OPTIONS?.delivered,
              singleOrder?.id
            );
          }}
        />
      );
    } else if (singleOrder?.status === ORDERS_STATUSES?.inProgress) {
      return (
        <CommonButton
          text="In-Transit"
          className="bg-red-100 text-red-500 !px-4 py-2 rounded hover:bg-red-200 transition"
          type="button"
          onClick={() => {
            handleStatusChange(
              UPDATE_STATUS_OPTIONS?.inTransit,
              singleOrder?.id
            );
          }}
        />
      );
    } else if (
      singleOrder?.status === ORDERS_STATUSES?.rejected ||
      singleOrder?.status === ORDERS_STATUSES?.delivered
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
              handleStatusChange(
                UPDATE_STATUS_OPTIONS?.inProgress,
                singleOrder?.id
              );
            }}
          />
          <CommonButton
            text="Decline"
            className="bg-red-100 text-red-500 !px-4 py-2 rounded hover:bg-red-200 transition"
            type="button"
            onClick={() => {
              handleStatusChange(
                UPDATE_STATUS_OPTIONS?.rejected,
                singleOrder?.id
              );
            }}
          />
        </>
      );
    }
  };
  return (
    <>
      {pageLoader && <PageLoader />}
      <div className="mx-auto p-6 bg-white shadow-md rounded-lg">
        <div className="flex justify-between mb-3">
          <BackButton prevRoute={prevRoute ? prevRoute : "/orders-management"} />
          <div className="links mt-2 flex items-center gap-2">
            <CommonButton text={T["view_invoice_info"]} className="!bg-[#FF6D2F] text-white !px-6 py-2 rounded" type="button" onClick={() => navigate(`/payment-history`, { state: { order_id: singleOrder?.order_id } })} />
            <CommonButton text={T["view_customer"]} className="!bg-[#FF6D2F] text-white !px-6 py-2 rounded" type="button" onClick={() => navigate(`/customers`, { state: { email: singleOrder?.user?.email } })} />
            <div>{returnButtonBasedOnStatus()}</div>
          </div>
        </div>
        <div className="flex justify-between singleOrders-start border-b pb-4">
          <div>
            <h2 className="text-lg font-semibold">
              Order{" "}
              <span className="text-gray-500">#{singleOrder?.order_id}</span>
            </h2>
            {/* <p className="text-sm text-gray-500">
              Payment via Elavon Converge EU Gateway. Customer IP:
              192.255.18.132
            </p> */}
          </div>
          <span className="text-green-500 font-medium">
            ● {singleOrder?.status}
          </span>
        </div>

        <div className="flex justify-between border-t pt-5 flex-col">
          <div className="flex justify-between mb-4">
            <div className="flex flex-col w-[50%]">
              <div className="mb-4">
                <strong>#{singleOrder?.order_id}</strong>
              </div>
              <ul className="flex flex-col gap-3">
                <li className="flex gap-3 capitalize">
                  {userSvg}{" "}
                  {createName(
                    singleOrder?.user?.first_name,
                    singleOrder?.user?.last_name
                  )}
                </li>
                <li className="flex gap-3">
                  {mailIcon} {singleOrder?.email}
                </li>
                <li className="flex gap-3">
                  {phoneIcon}
                  {singleOrder?.contact_number}
                </li>
              </ul>
            </div>
            <div className="flex flex-col w-[50%]">
              <div className="billing_Address">
                {singleOrder?.address && (
                  <div>
                    <b>{T["billing_address"]}</b>
                    <br />
                    <span className="text-[14px]">
                      {" "}
                      {singleOrder?.address}
                    </span>
                  </div>
                )}
              </div>
              <div className="shipping_Address">
                {singleOrder?.address && (
                  <div>
                    <b>{T["shipping_address"]}</b>
                    <br />
                    <span className="text-[14px]">
                      {" "}
                      {singleOrder?.address}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/* <strong>Details:</strong> */}
            <div></div>
            <div></div>
          </div>
          <div className="products">
            <strong>Products:</strong>
            <div className="products-table">
              <table className="w-full">
                <thead>
                  {PRODUCT_HEADINGS?.map((th) => (
                    <th className="text-start py-3">{th}</th>
                  ))}
                </thead>
                <tbody>
                  {singleOrder?.items?.map((el, idx) => (
                    <tr>
                      <td className="w-[10%]">{idx + 1}</td>
                      <td>
                        <div className="name flex singleOrders-center space-x-2 py-2">
                          <div className="picture">
                            <img
                              src={createPreview(
                                el?.product?.product?.images?.[0]?.image
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
                      <td>{el?.price} {" "} {PRICE_UNIT}</td>
                      <td>{el?.quantity}</td>
                      <td>{el?.price * el?.quantity}</td>
                    </tr>
                  ))}
                  {/* singleOrder subtotal */}
                  <tr>
                    <td colSpan={12} className="bg-[#f7f7f7] border-0 py-3">
                      <div className="singleOrder-subtotal text-end">
                        <b className="w-[180px] inline-block mr-5">
                          {T["subtotal"]}  :
                        </b>{" "}
                        <span className="w-[100px] inline-block text-start">
                          {singleOrder?.total_amount} {" "} {PRICE_UNIT}
                        </span>
                      </div>
                      {/* commented for future use */}
                      {/* <div className="singleOrder-subtotal text-end">
                        <b className="w-[180px] inline-block mr-5">
                          {T["platform_fee"]}  :
                        </b>{" "}
                        <span className="w-[100px] inline-block text-start">
                          {singleOrder?.platform_fee} {" "} {PRICE_UNIT}
                        </span>
                      </div> */}

                      {/* commented for future use */}

                      {/* <div className="singleOrder-subtotal text-end">
                        <b className="w-[180px] inline-block mr-5">
                          {T["packing_fee"]}  :
                        </b>{" "}
                        <span className="w-[100px] inline-block text-start">
                          {singleOrder?.packing_fee
                            ? singleOrder?.packing_fee
                            : "0 SEK"} {" "} {PRICE_UNIT}
                        </span>
                      </div> */}
                      {/* commented for future use */}
                      {/* <div className="singleOrder-subtotal text-end">
                        <b className="w-[180px] inline-block mr-5">
                          {T["shipping_fee"]}  :
                        </b>{" "}
                        <span className="w-[100px] inline-block text-start">
                          {singleOrder?.shipping_fee
                            ? singleOrder?.packing_fee
                            : "0 SEK"} {" "} {PRICE_UNIT}
                        </span>
                      </div> */}
                      <div className="singleOrder-subtotal text-end">
                        <b className="w-[180px] inline-block mr-5">
                          {T["vat"]}  :{" "}
                        </b>
                        <span className="w-[100px] inline-block text-start">
                          {singleOrder?.vat_amount || "0 SEK"} {" "} {PRICE_UNIT}
                        </span>
                      </div>

                      <div className="singleOrder-subtotal text-end">
                        <b className="w-[180px] inline-block mr-5">
                          {T["discount_uppercase"]}  :
                        </b>{" "}
                        <span className="w-[100px] inline-block text-start">
                          {singleOrder?.discount_amount
                            ? `-${singleOrder?.discount_amount}`
                            : "0 SEK"} {" "} {PRICE_UNIT}
                        </span>
                      </div>

                      <hr className="mb-2 mt-2" />
                      <div className="singleOrder-subtotal text-end">
                        <b className="w-[180px] inline-block mr-5">
                          {T["total"]} :
                        </b>
                        <span className="w-[100px] inline-block text-start">
                          {singleOrder?.final_amount || "0 SEK"} {" "} {PRICE_UNIT}
                        </span>
                      </div>
                      <div className="buttons flex items-center space-x-4">
                        <div className="notify-out-of-stock">
                          {/* Add button functionality here */}
                        </div>
                        <div className="mark-delivered">
                          {/* Add button functionality here */}
                        </div>
                      </div>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {statusChangeInfo?.show && (
        <ChangeStatusModal
          description={`This action will update the status of the order and cannot be undone`}
          onStatusChange={changeStatus}
          loader={buttonLoader}
          onCancel={handleStatusCancel}
        >
          <p>
            Are you sure you want to update order status to{" "}
            <span className="capitalize">
              {STATUS_TO_TEXT[statusChangeInfo?.status]}
            </span>
          </p>
        </ChangeStatusModal>
      )}
    </>
  );
};

export default SingleOrder;
