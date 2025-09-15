import React, { useEffect, useState } from "react";
import FilterSection from "../Components/Common/FilterSection";
import {
  ITEMS_PER_PAGE,
  PAYMENT_STATUS,
  PAYMENT_HISTORY_SORT_BY,
  UPDATE_DESCRIPTION_TEXT,
  DEFAULT_ERROR_MESSAGE,
} from "../constant";
import {
  NOTIFY_USER_API,
  PAYMENT_ENDPOINT,
  PAYMENT_STATUS_ENDPOINT,
} from "../api/endpoints";
import usePagination from "../hooks/usePagination";
import useLoader from "../hooks/useLoader";
import { makeApiRequest, METHODS } from "../api/apiFunctions";
import TableWrapper from "../Wrappers/TableWrapper";
import NoDataFound from "../Components/Common/NoDataFound";
import SinglePaymentRow from "../Components/SinglePaymentRow";
import Pagination from "../Components/Common/Pagination";
import PageLoader from "../loaders/PageLoader";
import { T } from "../utils/languageTranslator";
import { handlePrintPdf, handleViewPdf } from "../utils/helpers";
import { successType, toastMessage } from "../utils/toastMessage";
import ChangeStatusModal from "../Components/Common/ChangeStatusModal";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
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
  // T["id"],
  T["s_no"],
  T["customer_name"],
  T["order_date"],
  T["order_id"],
  T["invoice_number"],
  T["amount"],
  T["status"],
  // T["transaction_id"],
  T["actions"],
];
const PaymentHistory = () => {
  const formConfig = useForm();
  const location = useLocation();
  const { watch, setValue } = formConfig;
  const { page, onPageChange, setPage } = usePagination();
  const { toggleLoader, pageLoader, setPageLoader } = useLoader();
  const [filters, setFilters] = useState({
    status: "",
    sort_by: "asc",
    search: "",
  });
  const [totalData, setTotalData] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [statusValue, setStatusValue] = useState(null);
  const [statusChangeInfo, setStatusChangeInfo] = useState({
    show: false,
    invoiceId: null,
    status: "",
  });
  const [searchInput, setSearchInput] = useState("");
  const [buttonLoader, setButtonLoader] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [page, filters]);
  const fetchPayments = () => {
    let apiParams = {}
    setPageLoader((prev) => true);
    if(location?.state?.order_id){
        apiParams = {
        ...filters,
        page: page,
        search:location?.state?.order_id
      };
    } else{
      apiParams = {
        ...filters,
        page: page,
      };
    }
    makeApiRequest({
      endPoint: PAYMENT_ENDPOINT,
      params: apiParams,
      method: METHODS.get,
      isCustom: true,
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

  const handleActions = ({ action, pdfUrl }) => {
    if (action === "view") {
      pdfUrl && handleViewPdf(pdfUrl);
    } else {
      pdfUrl && handlePrintPdf(pdfUrl);
    }
  };
  const handleFilterChange = (filterName, value) => {
    console.log(filterName, value, "filtername and value");
    const temp = { ...filters };
    temp[filterName] = value;
    setFilters(temp);
    if (!searchInput) {
      temp["search"] = "";
    }
    setPage(1);
  };
  console.log(filters, "filters");
  const changeStatus = () => {
    const notify_user = watch("notify_user");
    const { status, invoiceId } = statusChangeInfo;
    setButtonLoader((prev) => true);
    const payload = {
      status: status,
    };
    makeApiRequest({
      endPoint: PAYMENT_STATUS_ENDPOINT,
      method: METHODS?.patch,
      payload: payload,
      update_id: invoiceId,
    })
      .then((res) => {
        if (notify_user) {
          handleNotifyAPI();
        } else {
          toastMessage("Status updated successfully", successType);
          handleStatusCancel();
          setButtonLoader((prev) => false);
          fetchPayments();
        }
      })
      .catch((err) => {
        toastMessage(err?.response?.data || DEFAULT_ERROR_MESSAGE);
        setButtonLoader((prev) => false);
        handleStatusCancel();
      });
  };
  const handleStatusCancel = () => {
    setStatusChangeInfo({
      status: "",
      show: false,
      invoiceId: null,
    });
    setValue("notify_user", false);
    setButtonLoader((prev) => false);
  };
  const handleNotifyAPI = () => {
    const payload = {
      invoice_id: statusChangeInfo?.invoiceId,
    };
    makeApiRequest({
      endPoint: NOTIFY_USER_API,
      method: METHODS?.post,
      payload: payload,
    })
      .then((res) => {
        const successMessage = res?.data?.success;
        toastMessage(` ${successMessage}`, successType);
        handleStatusCancel();
        setButtonLoader((prev) => false);
        fetchPayments();
      })
      .catch((err) => {
        toastMessage(err?.response?.data || DEFAULT_ERROR_MESSAGE);
        setButtonLoader((prev) => false);
        handleStatusCancel();
      });
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
          isPayment={true}
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
                handleChangeStatus={(status, invoiceId) => {
                  setStatusChangeInfo({
                    show: true,
                    invoiceId: invoiceId,
                    status: status,
                  });
                }}
                statusValue={statusValue}
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
        {statusChangeInfo?.show && (
          <ChangeStatusModal
            description={UPDATE_DESCRIPTION_TEXT}
            onStatusChange={changeStatus}
            loader={buttonLoader}
            onCancel={handleStatusCancel}
            isPayment={true}
            formConfig={formConfig}
          >
            <p>
              {T["are_you_sure_you_want_to_update_status_to"]}{" "}
              <span className="capitalize">{statusChangeInfo?.status}</span>
            </p>
          </ChangeStatusModal>
        )}
      </>
    </>
  );
};

export default PaymentHistory;
