import React, { useEffect, useState } from "react";
import {
  ACTIONS,
  BULK_COUPON_DELETE_DESCRIPTION,
  BULK_DELETE_TITLE,
  DEFAULT_ERROR_MESSAGE,
  DISCOUNTS_SORT_BY,
  ITEMS_PER_PAGE,
  SORT_VALUES,
  TYPE_OPTIONS,
} from "../constant";
import FilterSection from "../Components/Common/FilterSection";
import usePagination from "../hooks/usePagination";
import {
  bulkActionDiscount,
  makeApiRequest,
  METHODS,
} from "../api/apiFunctions";
import useLoader from "../hooks/useLoader";
import PageLoader from "../loaders/PageLoader";
import NoDataFound from "../Components/Common/NoDataFound";
import SingleDiscountRow from "../Components/SingleDiscountRow";
import { DISCOUNT_ENDPOINT, DISCOUNT_TRASH_ENDPOINT } from "../api/endpoints";
import Pagination from "../Components/Common/Pagination";
import TableWrapper from "../Wrappers/TableWrapper";
import useModalToggle from "../hooks/useModalToggle";
import DeleteConfirmationModal from "../Modals/DeleteConfirmationModal";
import {
  actionToText,
  createDeleteConfirmationDescription,
  createDeleteConfirmationTitle,
  deleteItemBasedOnId,
  filterDeletedItems,
  getSortValue,
  handleBulkMessage,
  removeLeadingDash,
} from "../utils/helpers";
import { successType, toastMessage } from "../utils/toastMessage";
import CommonButton from "../Components/Common/CommonButton";
import DiscountTypeSection from "../Components/DiscountTypeSection";
import { useNavigate } from "react-router-dom";
import { T } from "../utils/languageTranslator";
import useSelectedItems from "../hooks/useSelectedItems";
const filterFields = [
  {
    type: "select",
    defaultOption: T["select_type"],
    options: TYPE_OPTIONS,
    filterName: "status",
  },
  {
    type: "select",
    defaultOption: T["sort_by"],
    options: DISCOUNTS_SORT_BY,
    filterName: "sort_by",
  },
  {
    type: "select",
    defaultOption: T["select_action"],
    options: ACTIONS,
    filterName: "action",
  },

  {
    type: "search",
    filterName: "search",
    placeholder: T["search_coupon"],
  },
];
const DISCOUNTS_COLUMNS = [
  "checkbox",
  T["coupon"],
  T["added_on"],
  // T["method"],
  T["type"],
  T["combinations"],
  T["status"],
];

const Discounts = () => {
  const navigate = useNavigate();
  const { page, onPageChange, setPage } = usePagination();
  const { toggleLoader, pageLoader, setPageLoader } = useLoader();
  const [filters, setFilters] = useState({
    sort_by: "",
    sort: "asc",
    search: "",
    action: "",
  });
  const [discounts, setDiscounts] = useState([]);
  const [totalData, setTotalData] = useState([]);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const { showModal: showDeleteModal, toggleModal: toggleDeleteModal } =
    useModalToggle();

  const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState({
    show: false,
    payload: {},
    value: "",
  });
  const [bulkDeleteLoader, setBulkDeleteLoader] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState({
    show: false,
    itemToDelete: null,
    status: "",
  });


  const {
    showModal: showDiscountTypeSection,
    toggleModal: toggleDiscountTypeSection,
  } = useModalToggle();
  const {
    selectedItems: selectedDiscount,
    setSelectedItems: setSelectedDiscount,
    handleSelectItems: handleSelectedDiscount,
    selectAllItems,
  } = useSelectedItems();
  useEffect(() => {
    // toggleLoader("pageLoader");
    fetchDiscounts();
  }, [filters, page]);
  const fetchDiscounts = () => {
    const apiParams = {
      ...filters,
      page: page,
    };
    setPageLoader((prev) => true);
    makeApiRequest({
      endPoint: DISCOUNT_ENDPOINT,
      method: METHODS.get,
      params: apiParams,
    })
      .then((res) => {
        setDiscounts(res?.data?.results);
        setTotalData(res?.data?.count);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setPageLoader((prev) => false);
      });
  };

  const handleFilterChange = (filterName, value) => {
    if (filterName === "action") {
      if (selectedDiscount?.length) {
        const payload = {
          coupons: [...selectedDiscount],
          status: value,
        };

        if (value == "delete") {
          setBulkDeleteConfirmation({
            show: true,
            payload: { ...payload },
            value: value,
          });
          return;
        }
        setPageLoader((prev) => true);
        bulkActionDiscount(payload)
          .then((res) => {
            toastMessage(
              `Discounts ${actionToText[value]} successfully`,
              successType
            );
          })
          .catch((err) => {
            toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
            setPage(1);
          })
          .finally(() => {
            setSelectedDiscount([]);
            setPage(1);
            setFilters({ ...filters, action: "" });
            setPageLoader((prev) => false);
          });
      } else {
        toastMessage(handleBulkMessage("discount"));
      }
    } else {
      const temp = { ...filters };
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
    }
  };

  const handleActions = ({ action, deleteItem, editItem }) => {
    if (action === "delete") {
      const { id, is_deleted } = deleteItem;
      setDeleteInfo({
        show: true,
        itemToDelete: deleteItem,
        status: is_deleted ? "delete" : "trash",
      });
      // toggleDeleteModal();
      // setItemToDelete(delete_id);
    }
    if (action === "edit") {
      const state = {
        type: editItem?.coupon_type,
        isEdit: true,
        editId: editItem?.id,
      };
      navigate("/add-edit-discount", { state: state });
    }
  };
  const deleteDiscount = () => {
    const { status, itemToDelete } = deleteInfo;
    const isTrash = !itemToDelete?.is_deleted;
    setDeleteLoader((prev) => true);
    makeApiRequest({
      endPoint:isTrash ? DISCOUNT_TRASH_ENDPOINT : DISCOUNT_ENDPOINT,
      method:isTrash ? METHODS.patch : METHODS.delete,
      delete_id: isTrash ? null : itemToDelete?.id,
      update_id: isTrash ? itemToDelete?.id : null,
      payload: isTrash ? {is_deleted:true,is_active:false} : null,
    })
      .then((res) => {
        toastMessage(`Discount ${isTrash ? "moved to trash": "deleted"} successfuly`, successType);
        // setDiscounts(deleteItemBasedOnId(discounts, itemToDelete));
        if (page === 1) {
          fetchDiscounts();
        } else {
          setPage(1);
        }
      })
      .catch((err) => {
        console.log(err);
        toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
      })
      .finally(() => {
        setItemToDelete(null);
        setDeleteInfo({
          show: false,
          itemToDelete: null,
          status: "",
        });
        setDeleteLoader((prev) => false);
      });
  };
  const bulkDeleteCoupon = () => {
    console.log("bulkDeleteCoupon");
    setBulkDeleteLoader((prev) => true);
    const payload = bulkDeleteConfirmation?.payload;
    const value = bulkDeleteConfirmation?.value;
    bulkActionDiscount(payload)
      .then((res) => {
        toastMessage(
          `Discounts ${actionToText[value]} successfully`,
          successType
        );
      })
      .catch((err) => {
        toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
        setPage(1);
      })
      .finally(() => {
        setSelectedDiscount([]);
        setPage(1);
        setFilters({ ...filters, action: "" });
        setBulkDeleteLoader((prev) => false);
        setBulkDeleteConfirmation({ show: false, payload: {}, value: "" });
      });

  };
  return (
    <div>
      {pageLoader && <PageLoader />}
      <>
        <FilterSection
          filterFields={filterFields}
          handleFilterChange={handleFilterChange}
          filters={filters}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
        >
          <CommonButton
            text="Add New Coupon"
            onClick={toggleDiscountTypeSection}
            className="orange_btn"
          />
        </FilterSection>
        <TableWrapper
          columns={DISCOUNTS_COLUMNS}
          onCheckboxChange={(e) => {
            selectAllItems(e, discounts);
          }}
          checked={
            discounts?.length && discounts?.length === selectedDiscount?.length
          }
        >
          {discounts?.length ? (
            discounts?.map((it, idx) => (
              // filterDeletedItems(discounts)?.map((it, idx) => (
              <SingleDiscountRow
                item={it}
                key={idx}
                handleActions={handleActions}
                selectedDiscount={selectedDiscount}
                handleSelectedDiscount={handleSelectedDiscount}
              />
            ))
          ) : (
            <NoDataFound />
          )}
        </TableWrapper>
      </>

      <Pagination
        onPageChange={onPageChange}
        itemsPerPage={ITEMS_PER_PAGE}
        totalData={totalData}
        currentPage={page}
      />
       {deleteInfo?.show && (
        <DeleteConfirmationModal
          title={createDeleteConfirmationTitle(
            "discount",
            deleteInfo?.status
          )}
          description={createDeleteConfirmationDescription(
            "discount",
            deleteInfo?.status
          )}
          onCancel={() => {
            setDeleteInfo({
              show: false,
              itemToDelete: null,
              status: "",
            });
          }}
          deleteText={deleteInfo?.status === "delete" ? "delete" : "move_to_trash"}
          loader={deleteLoader}
          onDelete={deleteDiscount}
        />
      )}
      
      {bulkDeleteConfirmation?.show && (
        <DeleteConfirmationModal
          title={BULK_DELETE_TITLE}
          description={BULK_COUPON_DELETE_DESCRIPTION}
          onCancel={() => {
            setBulkDeleteConfirmation({ show: false, payload: {}, value: "" });
          }}
          loader={bulkDeleteLoader}
          onDelete={bulkDeleteCoupon}
        />
      )}
      {/* update required: need to add a blurr effect in this from designer also for delete modal */}
      {showDiscountTypeSection && (
        <DiscountTypeSection onClose={toggleDiscountTypeSection} />
      )}
    </div>
  );
};

export default Discounts;
