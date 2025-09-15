import React from "react";
import Eye from "../../public/icons/eye";
import Cart from "../../public/icons/cart";
import QuestionMark from "../../public/icons/questionMark";
import Location from "../../public/icons/location";
import moment from "moment";
import { REORDER_ENDPOINT } from "@/_Api Handlers/endpoints";
import { INSTANCE } from "@/_Api Handlers/apiConfig";
import { callApi } from "@/_Api Handlers/apiFunctions";
import { toastMessage } from "@/_utils/toastMessage";
import { T } from "@/utils/languageTranslator";

const ProfileOrder = ({ toggleSidebar, handleSideBarItem, ordersData }) => {

  const inTransitOrders = ordersData?.filter(
    (order) => order?.status === "In transit"
  );
  const pastOrders = ordersData?.filter(
    (order) => order?.status === "Payment pending"
  );
  const delivered = ordersData?.filter(
    (order) => order?.status === "Delivered"
  );
  const inProgress = ordersData?.filter(
    (order) => order?.status === "In progress"
  );
  const rejected = ordersData?.filter((order) => order?.status === "Rejected");

  const canceled = ordersData?.filter((order) => order?.status === "Canceled");

  const handleOrder = (id) => {
    handleSideBarItem("orders", id);
    toggleSidebar();
  };

  return (
    <div className="w-full">
      {/* Orders Section */}
      {!inTransitOrders?.length &&
        !pastOrders?.length &&
        !delivered?.length &&
        !inProgress?.length &&
        !rejected?.length &&
        !canceled?.length ? (
        <div>No Orders</div>
      ) : (
        <>
          {inTransitOrders?.length > 0 && (
            <>
              <h3 className="text-black font-extrabold mb-2">
                {T["in_transit_orders"]}
              </h3>
              {inTransitOrders?.map((order) => (
                <Order
                  order={order}
                  handleOrder={handleOrder}
                  showCartIcon={false}
                />
              ))}
            </>
          )}

          {pastOrders?.length > 0 && (
            <>
              <h3 className="text-black font-extrabold mb-2">Past Orders</h3>
              {pastOrders?.map((order) => (
                <Order
                  order={order}
                  handleOrder={handleOrder}
                  showCartIcon={true}
                />
              ))}
            </>
          )}

          {delivered?.length > 0 && (
            <>
              <h3 className="text-black font-extrabold mb-2">
                Delivered Orders
              </h3>
              {delivered?.map((order) => (
                <Order
                  order={order}
                  handleOrder={handleOrder}
                  showCartIcon={true}
                />
              ))}
            </>
          )}

          {inProgress?.length > 0 && (
            <>
              <h3 className="text-black font-extrabold mb-2">
                In Progress Orders
              </h3>
              {inProgress?.map((order) => (
                <Order
                  order={order}
                  handleOrder={handleOrder}
                  showCartIcon={false}
                />
              ))}
            </>
          )}

          {rejected?.length > 0 && (
            <>
              <h3 className="text-black font-extrabold mb-2">
                Rejected Orders
              </h3>
              {rejected?.map((order) => (
                <Order
                  order={order}
                  handleOrder={handleOrder}
                  showCartIcon={true}
                />
              ))}
            </>
          )}

          {canceled?.length > 0 && (
            <>
              <h3 className="text-black font-extrabold mb-2">
                Canceled Orders
              </h3>
              {canceled?.map((order) => (
                <Order
                  order={order}
                  handleOrder={handleOrder}
                  showCartIcon={true}
                />
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ProfileOrder;

const Order = ({ order, handleOrder, showCartIcon }) => {

  const handleRepeatOrder = (order) => {
    const payload = order?.items?.map((item) => (
      { "product_variant": item?.product?.id, "quantity": item?.quantity }
    ))

    callApi({
      endPoint: REORDER_ENDPOINT,
      method: "POST",
      instanceType: INSTANCE?.authorized,
      payload: payload,
    })
      .then((res) => {
        toastMessage("Order successful", "success");
      })
      .catch((error) => {
        console.error("Error getting address:", error);
        toastMessage(error?.response?.data?.error || "Something went wrong", "error");
      });
  }
  console.log(order.status, "order status")

  return (
    <div
      key={order.id}
      className="border border-[#ddd] rounded-xl p-4 mb-4 flex justify-between"
    >
      <div>
        <div className="mb-2 text-[#555] flex items-center gap-2">
          Order #{order.order_id} |{" "}
          {moment(order?.created_at).format("ddd, MMM DD, YYYY, hh:mm A")}
          <div className="bg-[#CCFFCF] text-[#08A300] font-bold px-2 py-1 rounded-lg ml-4">
            {order.status}
          </div>
        </div>
        {/* <p className="text-[#555] text-sm mb-1">{`${order?.shipping_address?.address},${order?.shipping_address?.city},${order?.shipping_address?.state}`}</p> */}
        <p className="text-[#555] text-sm mb-1 flex gap-2 items-center"><Location />{order?.address}</p>
        <p className="text-black text-sm font-extrabold mb-1">{T["items_order"]}</p>
        {order?.items?.map((itm, index) => (
          <p
            className="text-[#555] text-sm"
            key={index}
          >{`${itm?.product?.name} (${itm?.quantity})`}</p>
        ))}
      </div>
      <div className="flex flex-col justify-between items-end mt-4 py-4">
        <div className="text-[#333] text-sm">
          <span className="text-black font-extrabold text-sm">  {["In transit", "Delivered"].includes(order.status)
            ? order.payment_status === "Paid"
              ? "Paid"
              : "Pay Not Paid"
            : ""}:</span>{" "}
          {order.total_amount}
        </div>
        <div className="flex gap-2 mt-2">
          <div
            className="rounded-full p-2 bg-[#F2FFEC] cursor-pointer"
            onClick={() => handleOrder(order?.id)}
          >
            <Eye />
          </div>
          {showCartIcon && (
            <div className="rounded-full p-2 bg-[#F2FFEC] cursor-pointer" onClick={() => handleRepeatOrder(order)}>
              <Cart />
            </div>
          )}
          {/* <div className="rounded-full p-2 bg-[#F2FFEC]">
            <QuestionMark />
          </div> */}
        </div>
      </div>
    </div>
  );
};
