import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useLoader from "../hooks/useLoader";
import usePagination from "../hooks/usePagination";
import { makeApiRequest, METHODS } from "../api/apiFunctions";
import {
  CONFIGURATION_ENDPOINT,
  CONFIGURATION_PATCH_ENDPOINT,
} from "../api/endpoints";
import Pagination from "../Components/Common/Pagination";
import {
  CONFIGURATION_ITEMS_PER_PAGE,
  DEFAULT_ERROR_MESSAGE,
  UPDATE_DESCRIPTION_TEXT,
  ZIP_CONFIGURATION_SORT_BY,
} from "../constant";
import FilterSection from "../Components/Common/FilterSection";
import CommonButton from "../Components/Common/CommonButton";
import useModalToggle from "../hooks/useModalToggle";
import AddEditConfiguration from "../Components/AddEditConfiguration";
import { getState, handleEdit, returnAddressInfo } from "../utils/helpers";
import { successType, toastMessage } from "../utils/toastMessage";
import TableWrapper from "../Wrappers/TableWrapper";
import NoDataFound from "../Components/Common/NoDataFound";
import SingleConfigurationRow from "../Components/SingleConfigurationRow";
import DeleteConfirmationModal from "../Modals/DeleteConfirmationModal";
import PageLoader from "../loaders/PageLoader";
import { T } from "../utils/languageTranslator";
import ChangeStatusModal from "../Components/Common/ChangeStatusModal";
const filterFields = [
  {
    type: "search",
    filterName: "search",
    placeholder: T["search_configuration"],
  },
  {
    type: "select",
    filterName: "sort_by",
    defaultOption: T["sort_by"],
    options: ZIP_CONFIGURATION_SORT_BY,
  },
];
const CONFIGURATION_COLUMNS = [
  "S.No",
  "ZIP Code",
  "Area/Location Name",
  "Min. Order Amount",
  "Delivery Cost",
  "Availability",
  // "Delivery Threshold",
  "Action",
];
const ZipConfiguration = () => {
  const formConfig = useForm();
  const { reset } = formConfig;
  const { page, onPageChange, setPage } = usePagination();
  const { pageLoader, toggleLoader } = useLoader();
  const {
    toggleModal: toggleConfiguration,
    showModal: showConfigurationSection,
  } = useModalToggle();
  const [buttonLoader, setButtonLoader] = useState(false);
  const { toggleModal: toggleDeleteModal, showModal: showDeleteModal } =
    useModalToggle();

  const [filters, setFilters] = useState({
    search: "",
    sort_by: "",
  });
  const [configurations, setConfigurations] = useState([]);
  const [totalData, setTotalData] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editInfo, setEditInfo] = useState({
    isEdit: false,
    editItem: null,
  });
  const [statusChangeInfo, setStatusChangeInfo] = useState({
    show: false,
    item: null,
    status: "",
  });

  const [deleteLoader, setDeleteLoader] = useState(false);
  const [btnLoaders, setBtnLoaders] = useState({
    publish: false,
    draft: false,
  });
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    fetchConfigurations();
  }, [page, filters]);

  const fetchConfigurations = () => {
    toggleLoader("pageLoader");
    const apiParams = {
      ...filters,
      page: page,
    };
    makeApiRequest({
      endPoint: CONFIGURATION_ENDPOINT,
      params: apiParams,
      method: METHODS?.get,
    })
      .then((res) => {
        setTotalData(res?.data?.count);
        setConfigurations(res?.data?.results);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        toggleLoader("pageLoader");
      });
  };

  //  to open from add config, edit and close
  const handleConfigurationSection = ({ action }) => {
    if (action === "open") {
      toggleConfiguration();
    } else if (action === "close") {
      reset();
      toggleConfiguration();
      setEditInfo({
        isEdit: false,
        editItem: null,
      });
    }
  };

  const handleFilterChange = (filterName, value) => {
    const temp = { ...filters };
    temp[filterName] = value;
    if (!searchInput) {
      temp["search"] = "";
    }
    setFilters(temp);
    setPage(1);
  };

  const onSubmit = (data, event) => {
    const addressInfo = {
      city: "",
      state: "",
    };
    console.log(data, "this is data");
    toggleLoader("buttonLoader");
    const buttonType = event.nativeEvent.submitter.name;
    const { isEdit, editItem } = editInfo;
    // for extracting state , city and country from address
    if (isEdit && !data?.address?.address_components) {
      addressInfo.state = editItem?.state;
      addressInfo.city = editItem?.city;
    } else {
      const { state, city, country } = returnAddressInfo(
        data?.address?.address_components
      );
      addressInfo.state = state;
      addressInfo.city = city;
    }

    const payload = {
      delivery_availability: data?.delivery_availability?.value,
      zip_code: data?.zip_code,
      // min_order_quantity: +data?.min_order_quantity,
      // delivery_threshold: +data?.delivery_threshold,
      // city: data?.city?.formatted_address || data?.city,
      city: addressInfo.state,
      address: data?.address?.formatted_address,
      state: getState(addressInfo.state),
      delivery_threshold: "21",
      min_order_quantity: 23,
      notes: data?.notes,
    };
    // appending delivery_cost and min_order_amount keys
    if (data?.delivery_cost) {
      payload["delivery_cost"] = +data?.delivery_cost;
    }
    if (data?.min_order_amount) {
      payload["min_order_amount"] = +data?.min_order_amount;
    }
    console.log(payload, "this is payload");
    setBtnLoaders({ ...btnLoaders, [buttonType]: !btnLoaders[buttonType] });
    makeApiRequest({
      endPoint: isEdit ? CONFIGURATION_PATCH_ENDPOINT : CONFIGURATION_ENDPOINT,
      method: isEdit ? METHODS?.patch : METHODS?.post,
      payload: payload,
      update_id: isEdit && editItem?.id,
    })
      .then((res) => {
        toastMessage(
          `Zip configuration ${isEdit ? "updated" : "created"} successfully`,
          successType
        );
        if (isEdit) {
          setConfigurations(
            handleEdit(configurations, editItem?.id, res?.data)
          );
        } else {
          // setConfigurations((prev) => [...prev, res?.data]);
          fetchConfigurations();
          setPage(1);
        }
        handleConfigurationSection({ action: "close" });
        setBtnLoaders({ publish: false, draft: false });
        setPage(1);
      })
      .catch((err) => {
        const zipCodeError = err?.response?.data?.zip_code?.[0];
        console.log(zipCodeError, "configuration error");
        toastMessage(zipCodeError || DEFAULT_ERROR_MESSAGE);
        if (!zipCodeError) {
          handleConfigurationSection({ action: "close" });
          setPage(1);
        }
        setBtnLoaders({ publish: false, draft: false });
      });
  };

  const handleActions = ({ action, delete_id, editItem }) => {
    if (action === "delete") {
      setItemToDelete(delete_id);
      toggleDeleteModal();
    } else if (action === "edit") {
      setEditInfo({ isEdit: true, editItem: editItem });
      toggleConfiguration();
    }
  };

  const deleteConfiguration = () => {
    setDeleteLoader((prev) => true);
    makeApiRequest({
      endPoint: "/zip/configurations/",
      method: METHODS.delete,
      delete_id: itemToDelete,
    })
      .then((res) => {
        if (page === 1) {
          fetchConfigurations();
        } else {
          setPage(1);
        }
        toastMessage("Zip configuration deleted successfully", successType);
      })
      .catch((err) => {
        toastMessage(DEFAULT_ERROR_MESSAGE);
      })
      .finally(() => {
        toggleDeleteModal();
        setItemToDelete(null);
        setDeleteLoader((prev) => false);
      });
  };

  const changeStatus = () => {
    const { item, status } = statusChangeInfo;
    const payload = {
      ...item,
      delivery_availability: status,
    };
    setButtonLoader((prev) => true);
    makeApiRequest({
      endPoint: CONFIGURATION_PATCH_ENDPOINT,
      method: METHODS?.patch,
      payload: payload,
      update_id: item?.id,
    })
      .then((res) => {
        toastMessage("Status updated successfully", successType);
        fetchConfigurations();
      })
      .catch((err) => {
        console.log(err?.response?.data, "this is error");
        toastMessage(err?.response?.data || DEFAULT_ERROR_MESSAGE);
      })
      .finally(() => {
        handleStatusCancel();
        setButtonLoader((prev) => false);
      });
  };
  const handleStatusCancel = () => {
    setStatusChangeInfo({
      show: false,
      item: null,
      status: "",
    });
  };

  return (
    <div>
      {pageLoader && <PageLoader />}
      <>
        <FilterSection
          filterFields={filterFields}
          handleFilterChange={handleFilterChange}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
        >
          <CommonButton
            text="Add Configuration"
            className="orange_btn"
            onClick={() => {
              handleConfigurationSection({ action: "open" });
            }}
          />
        </FilterSection>{" "}
        <TableWrapper columns={CONFIGURATION_COLUMNS}>
          {configurations?.length ? (
            configurations?.map((it, idx) => (
              <SingleConfigurationRow
                key={idx}
                item={it}
                index={idx}
                currentPage={page}
                handleActions={handleActions}
                handleChangeStatus={(status, item) => {
                  setStatusChangeInfo({
                    show: true,
                    item: item,
                    status: status,
                  });
                }}
              />
            ))
          ) : (
            <NoDataFound />
          )}
        </TableWrapper>
        <Pagination
          onPageChange={onPageChange}
          itemsPerPage={CONFIGURATION_ITEMS_PER_PAGE}
          totalData={totalData}
          currentPage={page}
        />
        {showConfigurationSection && (
          <AddEditConfiguration
            formConfig={formConfig}
            onSubmit={onSubmit}
            editInfo={editInfo}
            onClose={() => {
              handleConfigurationSection({ action: "close" });
            }}
            btnLoaders={btnLoaders}
          />
        )}
        {showDeleteModal && (
          <DeleteConfirmationModal
            title="Are you sure you want to delete this ZIP configuration?"
            description="This action cannot be redo.This action will permanently Delete this ZIP configuration"
            onCancel={() => {
              setItemToDelete(null);
              toggleDeleteModal();
            }}
            onDelete={deleteConfiguration}
            loader={deleteLoader}
          />
        )}
        {statusChangeInfo?.show && (
          <ChangeStatusModal
            description={`This action will update the availability status of the zip configuration`}
            onStatusChange={changeStatus}
            loader={buttonLoader}
            onCancel={handleStatusCancel}
            formConfig={formConfig}
          >
            <p>
              Are you sure you want to update status to{" "}
              <span className="capitalize">{statusChangeInfo?.status}</span>
            </p>
          </ChangeStatusModal>
        )}
      </>
    </div>
  );
};

export default ZipConfiguration;
