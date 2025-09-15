import React, { useEffect, useState } from "react";
import FilterSection from "../Components/Common/FilterSection";
import { makeApiRequest, METHODS } from "../api/apiFunctions";
import { ORDERS_ENDPOINT, ORDERS_HISTORY_ENDPOINT } from "../api/endpoints";
import TableWrapper from "../Wrappers/TableWrapper";
import NoDataFound from "../Components/Common/NoDataFound";
import SingleOrdersRow from "../Components/SingleOrdersRow";
import usePagination from "../hooks/usePagination";
import useLoader from "../hooks/useLoader";
import Pagination from "../Components/Common/Pagination";
import PageLoader from "../loaders/PageLoader";
import { useForm } from "react-hook-form";
import useModalToggle from "../hooks/useModalToggle";
import ViewOrderHistory from "../Components/ViewOrderHistory";
import {
  DUMMY_ORDERS_DATA,
  ITEMS_PER_PAGE,
  OPTIONS,
  ORDER_HISTORY_SORT_BY_OPTIONS,
  ORDERS_TYPE_OPTIONS,
  SORT_BY_OPTIONS,
  SORT_VALUES,
} from "../constant";
import { getSortValue, handlePrintPdf, handleViewPdf, removeLeadingDash } from "../utils/helpers";
import { toastMessage } from "../utils/toastMessage";
const filterFields = [
  {
    type: "select",
    filterName: "status",
    defaultOption: "Order Status",
    options: ORDERS_TYPE_OPTIONS,
  },
  {
    type: "select",
    filterName: "sort_by",
    defaultOption: "Sort by",
    options: ORDER_HISTORY_SORT_BY_OPTIONS,
  },
  {
    type: "search",
    filterName: "search",
    placeholder: "Search Order History",
  },
];
const ORDER_COLUMNS = [
  "S.No",
  "Customer Name",
  "Order ID",
  "Total Amount",
  "Order Date",
  "Items",
  "Quantity",
  // "Reason for Decline",
  "Actions",
];
const OrdersHistory = () => {
  const formConfig = useForm();
  const { page, onPageChange, setPage } = usePagination();
  const { showModal: showViewSection, toggleModal: toggleViewSection } =
    useModalToggle();
  const { toggleLoader, pageLoader } = useLoader();
  const [orderHistory, setOrderHistory] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  const [totalData, setTotalData] = useState(null);
  const [viewItem, setViewItem] = useState();
  const [filters, setFilters] = useState({
    status: "",
    sort_by: "",
    search: "",
    sort: "asc",
  });

  useEffect(() => {
    toggleLoader("pageLoader");
    const apiParams = {
      ...filters,
      page: page,
    };
    // setOrderHistory(DUMMY_ORDERS_DATA);
    makeApiRequest({
      // update required: Update with the actual endpoint
      endPoint: ORDERS_ENDPOINT,
      params: apiParams,
      method: METHODS.get,
    })
      .then((res) => {
        setOrderHistory(res?.data?.results);
        setTotalData(res?.data?.count);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        toggleLoader("pageLoader");
      });
  }, [page, filters]);

  const handleFilterChange = (filterName, value) => {
    let temp = { ...filters };
    if (filterName === "sort_by") {
      if (SORT_VALUES.includes(value)) {
        temp["sort"] = value;
        temp["sort_by"] = "";
      } else {
        temp["sort_by"] = removeLeadingDash(value);
        temp["sort"] = getSortValue(value);
      }
    } else {
      temp[filterName] = value;
    }
    setFilters(temp);
    setPage(1);
  };

  const handleActions = ({ action, url }) => {
    if (url) {
      if (action === "print") {
        handlePrintPdf(url);
      } else {
        handleViewPdf(url);
      }
    } else {
      toastMessage("No Invoice found for this order");
    }
  };
  return (
    <>
      {pageLoader && <PageLoader />}

      <>
        <FilterSection
          filterFields={filterFields}
          handleFilterChange={handleFilterChange}
          filters={filters}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
        />
        <TableWrapper columns={ORDER_COLUMNS}>
          {orderHistory?.length ? (
            orderHistory?.map((it, idx) => (
              <SingleOrdersRow
                key={idx}
                item={it}
                index={idx}
                currentPage={page}
                handleActions={handleActions}
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
        {showViewSection && (
          <ViewOrderHistory
            item={viewItem}
            onClose={() => {
              toggleViewSection();
            }}
            formConfig={formConfig}
          />
        )}
      </>
    </>
  );
};

export default OrdersHistory;
