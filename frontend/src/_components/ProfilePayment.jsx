// import React from "react";

// const ProfilePayment = () => {
//   const cards = [
//     {
//       id: 1,
//       type: "Visa",
//       number: "XXXX-XXXX-XXXX-1234",
//       validity: "02/2029",
//       default: true,
//       image: "/images/visa.png",
//     },
//     {
//       id: 2,
//       type: "Mastercard",
//       number: "XXXX-XXXX-XXXX-3214",
//       validity: "02/2029",
//       default: false,
//       image: "/images/master.png",
//     },
//     {
//       id: 3,
//       type: "Maestro",
//       number: "XXXX-XXXX-XXXX-8765",
//       validity: "02/2029",
//       default: false,
//       image: "/images/maestro.png",
//     },
//     {
//       id: 4,
//       type: "American Express",
//       number: "XXXX-XXXX-XXXX-4536",
//       validity: "02/2029",
//       default: false,
//       image: "/images/AmericanExpress.png",
//     },
//   ];

//   const handleDelete = (id) => {
//     console.log(`Delete card with id: ${id}`);
//   };

//   const handleMakeDefault = (id) => {
//     console.log(`Make card with id: ${id} default`);
//   };

//   return (
//     <div>
//       <h2 className="text-black font-extrabold mb-6">Payments</h2>
//       <h5 className="text-black font-extrabold mb-2">Saved Cards</h5>
//       <div className="flex flex-wrap gap-5">
//         {cards?.map((card) => (
//           <div
//             key={card.id}
//             className="border border-gray-300 rounded-lg p-4 flex flex-col justify-between shadow-sm gap-4 w-[48%]"
//           >
//             <div className="flex justify-between items-center gap-4">
//               <div>
//                 <img src={card.image} alt={card.type} className="w-10 h-10" />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600 mb-1">{card.number}</p>
//                 <p className="text-xs text-gray-400">Valid till {card.validity}</p>
//               </div>
//               <button
//                 className="bg-none border-none text-red-500 cursor-pointer"
//                 onClick={() => handleDelete(card.id)}
//               >
//                 DELETE
//               </button>
//             </div>
//             <div>
//               {card.default ? (
//                 <button className="bg-gray-100 text-black px-5 py-1 rounded-full">
//                   Default
//                 </button>
//               ) : (
//                 <button
//                   className="text-green-500 underline"
//                   onClick={() => !card.default && handleMakeDefault(card.id)}
//                 >
//                   Make Default
//                 </button>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//       <button className="mt-5 px-6 py-2 text-sm text-white bg-orange-500 border-none rounded-md cursor-pointer">
//         Add Card
//       </button>
//     </div>
//   );
// };

// export default ProfilePayment;

import React, { useEffect, useState } from "react";
import FilterSection from "../_components/_common/FilterSection";
import {
  PAYMENT_TYPE_OPTIONS,
  SORT_BY_OPTIONS,
  DUMMY_PAYMENT_DATA,
  ITEMS_PER_PAGE,
} from "../_constants/constant";
import {
  PAYMENT_ENDPOINT,
  PAYMENT_STATUS_ENDPOINT,
} from "../_Api Handlers/endpoints";
import usePagination from "../_hooks/usePagination";
import useLoader from "../_hooks/useLoader";
import { callApi, METHODS } from "../_Api Handlers/apiFunctions";
import TableWrapper from "../Wrappers/TableWrapper";
import NoDataFound from "../_components/_common/NoDataFound";
import SinglePaymentRow from "../_components/SinglePaymentRow";
import Pagination from "../_components/Pagination";
import PageLoader from "../loaders/PageLoader";
import { T } from "../utils/languageTranslator";
import { handlePrintPdf, handleViewPdf } from "@/utils/helpers";
import { successType, toastMessage } from "../utils/toastMessage";
import { INSTANCE } from "@/_Api Handlers/apiConfig";

export const PAYMENT_HISTORY_SORT_BY = [
  { label: "Date (Newest)", value: "asc" },
  { label: "Date (Oldest)", value: "desc" },
  { label: "User Name (A to Z)", value: "a_to_z" },
  { label: "User Name (Z to A)", value: "z_to_a" },
  { label: "Amount (Low to High)", value: "total_amount" },
  { label: "Amount (High to Low)", value: "-total_amount" },
];

export const PAYMENT_STATUS = [
  // { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
];

const filterFields = [
  {
    type: "select",
    filterName: "status",
    defaultOption: "Status",
    options: PAYMENT_STATUS,
  },
  {
    type: "select",
    filterName: "sort_by",
    defaultOption: T["sort_by"],
    options: PAYMENT_HISTORY_SORT_BY,
  },
  {
    type: "search",
    filterName: "search",
    placeholder: T["search_payment"],
  },
];
const PAYMENT_COLUMNS = [
  "S.No.",
  T["customer_name"],
  T["date"],
  T["order_id"],
  "Invoice Number",
  T["amount"],
  T["status"],
  // T["transaction_id"],
  T["action"],
];
const PaymentHistory = () => {
  const { page, onPageChange } = usePagination();
  const { toggleLoader, pageLoader, setPageLoader } = useLoader();
  const [filters, setFilters] = useState({
    status: "",
    sort_by: "asc",
    search: "",
  });
  const [totalData, setTotalData] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [statusValue, setStatusValue] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, [page, filters]);
  const fetchPayments = () => {
    setPageLoader((prev) => true);
    const apiParams = {
      ...filters,
      page: page,
    };
    callApi({
      // update required: Update with the actual endpoint
      endPoint: PAYMENT_ENDPOINT,
      params: apiParams,
      method: METHODS.get,
      instanceType: INSTANCE?.authorized,
    })
      .then((res) => {
        setPaymentHistory(res?.data?.results);
        setTotalData(res?.data?.count);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setPageLoader((prev) => false);
      });
  };

  // const handleActions = ({ action, pdfUrl }) => {
  //   if (action === "view") {
  //     // Update required : add logic for view here
  //     pdfUrl && handleViewPdf(pdfUrl);
  //   } else {
  //     // Update required: add logic for print here
  //     pdfUrl && handlePrintPdf(pdfUrl);
  //   }
  // };

  const handleActions = ({ action, pdfUrl }) => {
    if (action === "view") {
      // Update required : add logic for view here
      pdfUrl && handleViewPdf(pdfUrl);
    } else {
      // Update required: add logic for print here
      pdfUrl && handlePrintPdf(pdfUrl);
    }
  };

  const handleFilterChange = (filterName, value) => {
    const temp = { ...filters };
    temp[filterName] = value;
    setFilters(temp);
  };
  const changeStatus = (status, invoiceId) => {
    setPageLoader((prev) => true);
    const payload = {
      status: status,
    };
    callApi({
      endPoint: PAYMENT_STATUS_ENDPOINT,
      method: METHODS?.patch,
      payload: payload,
      update_id: invoiceId,
    })
      .then((res) => {
        toastMessage("Status updated successfully", successType);
        fetchPayments();
      })
      .catch((err) => {
        toastMessage(err?.response?.data);
      })
      .finally(() => {
        setPageLoader((prev) => false);
      });
  };
  return (
    <>
      {pageLoader && <PageLoader />}
      <div className="w-full">
        <FilterSection
          filterFields={filterFields}
          handleFilterChange={handleFilterChange}
          filters={filters}
        />
        <TableWrapper columns={PAYMENT_COLUMNS}>
          {paymentHistory?.length ? (
            paymentHistory?.map((it, idx) => (
              <SinglePaymentRow
                key={idx}
                item={it}
                index={idx}
                currentPage={page}
                handleActions={handleActions}
                changeStatus={changeStatus}
                statusValue={statusValue}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            ))
          ) : (
            <NoDataFound />
          )}
        </TableWrapper>
        <Pagination
          onPageChange={onPageChange}
          itemsPerPage={ITEMS_PER_PAGE}
          totalData={totalData}
          currentPage={page}
        />
      </div>
    </>
  );
};

export default PaymentHistory;
