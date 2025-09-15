import React, { useEffect, useState } from "react";
import { makeApiRequest, METHODS } from "../api/apiFunctions";
import usePagination from "../hooks/usePagination";
import {
  NOTIFICATION_DELETE_ENDPOINT,
  NOTIFICATION_UPDATE_ENDPOINT,
  NOTIFICTION_GET_ENDPOINT,
} from "../api/endpoints";
import useLoader from "../hooks/useLoader";
import { ACTIONS, DEFAULT_ERROR_MESSAGE, ITEMS_PER_PAGE, NOTIFICATION_STATUS_OPTIONS, RAW_MATERIALS_SORT_BY, TYPE_OPTIONS } from "../constant";
import NoDataFound from "../Components/Common/NoDataFound";
import Pagination from "../Components/Common/Pagination";
import SingleNotificationCard from "../Components/SingleNotificationCard";
import PageLoader from "../loaders/PageLoader";
import DeleteConfirmationModal from "../Modals/DeleteConfirmationModal";
import useModalToggle from "../hooks/useModalToggle";
import { successType, toastMessage } from "../utils/toastMessage";
import { useNavigate } from "react-router-dom";
import FilterSection from "../Components/Common/FilterSection";
import { T } from "../utils/languageTranslator";

const filterFields = [
  {
    type: "select",
    defaultOption: T["select_type"],
    options: NOTIFICATION_STATUS_OPTIONS,
    filterName: "search",
  },
  // {
  //   type: "search",
  //   filterName: "search",
  //   placeholder: T["search_notification"],
  // },
];

const Notifications = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    search: false,
  });

  const { page, onPageChange, setPage } = usePagination();
  const { toggleLoader, pageLoader } = useLoader();
  const { showModal: showDeleteModal, toggleModal: toggleDeleteModal } =
    useModalToggle();
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [notifications, setNotification] = useState([]);
  const [totalData, setTotalData] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, [page, filters]);

  const fetchNotifications = () => {
    toggleLoader("pageLoader");
    let apiParams = {
      page: page,
    };
    if(filters?.search === "unread"){
      apiParams["search"] = false;
    } else if (filters?.search === "read") {
      apiParams["search"] = true;
    } 
    makeApiRequest({
      endPoint: NOTIFICTION_GET_ENDPOINT,
      params: apiParams,
      method: METHODS.get,
      isNotification: true,
    })
      .then((res) => {
        setNotification(res?.data?.results);
        setTotalData(res?.data?.count);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        toggleLoader("PageLoader");
      });
  };

  const handleFilterChange = (filterName, value) => {
    console.log(value, "this is value")
    let temp = { ...filters };
    temp[filterName] = value;
    setFilters(temp);
    setPage(1);
  };

  const deleteNotification = () => {
    setDeleteLoader((prev) => true);
    makeApiRequest({
      endPoint: NOTIFICATION_DELETE_ENDPOINT,
      method: METHODS?.delete,
      delete_id: itemToDelete,
    })
      .then((res) => {
        toastMessage("Notification deleted successfully", successType);
        if (page === 1) {
          fetchNotifications();
        } else {
          setPage(1);
        }
      })
      .catch((err) => {
        toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
      })
      .finally((res) => {
        toggleDeleteModal();
        setDeleteLoader((prev) => false);
        setItemToDelete(null);
      });
  };

  const handleDeleteClick = (delete_id) => {
    toggleDeleteModal();
    setItemToDelete(delete_id);
  };

  const handleNotificationClick = (nt) => {
    const { meta_data } = nt;
    updateNotificationStatus(nt?.id);
    if (meta_data?.product_id) {
      navigate("/view-product", {
        state: { id: meta_data?.product_id, isViewOnly: true },
      });
    } else if (meta_data?.order_id) {
      navigate("/single-order", { state: { id: meta_data?.order_id } });
    }
  };

  const updateNotificationStatus = (notificationId) => {
    makeApiRequest({
      endPoint: NOTIFICATION_UPDATE_ENDPOINT,
      method: METHODS.patch,
      update_id: notificationId,
      payload: {
        is_read: true,
      }
    }).then((res) => {

    }).catch((err) => {
      console.log(err, "notification update error");
    });
  };

  return (
    <>
      {pageLoader ? (
        <PageLoader />
      ) : (
        <>
          <div className="mb-2">
            <FilterSection
              filterFields={filterFields}
              handleFilterChange={handleFilterChange}
              filters={filters}
              searchInput={searchInput}
              setSearchInput={setSearchInput}
            />
          </div>
          {notifications?.length ? (
            notifications?.map((it, idx) => (
              <SingleNotificationCard
                key={idx}
                item={it}
                handleDeleteClick={handleDeleteClick}
                handleNotificationClick={handleNotificationClick}
              />
            ))
          ) : (
            <NoDataFound />
          )}
          <Pagination
            onPageChange={onPageChange}
            currentPage={page}
            itemsPerPage={ITEMS_PER_PAGE}
            totalData={totalData}
          />
          {showDeleteModal && (
            <DeleteConfirmationModal
              title="Are you sure you want to remove this notification?"
              description="This action cannot be redo."
              onCancel={() => {
                setItemToDelete(null);
                toggleDeleteModal();
              }}
              onDelete={deleteNotification}
              loader={deleteLoader}
            />
          )}
        </>
      )}
    </>
  );
};

export default Notifications;
