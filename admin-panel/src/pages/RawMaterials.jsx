import React, { useEffect, useState } from "react";
import {
  bulkActionMaterial,
  INSTANCE,
  makeApiRequest,
  METHODS,
} from "../api/apiFunctions";
import { RAW_MATERIAL_ENDPOINT } from "../api/endpoints";
import usePagination from "../hooks/usePagination";
import useLoader from "../hooks/useLoader";
import { successType, toastMessage } from "../utils/toastMessage";
import {
  ACTIONS,
  BULK_DELETE_DESCRIPTION,
  BULK_DELETE_TITLE,
  BULK_RAW_MATERIAL_DELETE_DESCRIPTION,
  DEFAULT_ERROR_MESSAGE,
  DELETE_CONFIRMATION_DESCRIPTION,
  ITEMS_PER_PAGE,
  RAW_MATERIALS_SORT_BY,
  SORT_VALUES,
  TYPE_OPTIONS,
  YYYY_MM_DD,
} from "../constant";
import TableWrapper from "../Wrappers/TableWrapper";
import NoDataFound from "../Components/Common/NoDataFound";
import SingleRawMaterialRow from "../Components/SingleRawMaterialRow";
import useModalToggle from "../hooks/useModalToggle";
import DeleteConfirmationModal from "../Modals/DeleteConfirmationModal";
import {
  actionToText,
  createDeleteConfirmationDescription,
  createDeleteConfirmationTitle,
  createPayloadForRawMaterial,
  formatDate,
  getSortValue,
  handleBulkMessage,
  handleEdit,
  removeLeadingDash,
} from "../utils/helpers";
import Pagination from "../Components/Common/Pagination";
import AddEditRawMaterial from "../Components/AddEditRawMaterial";
import { useForm } from "react-hook-form";
import FilterSection from "../Components/Common/FilterSection";
import CommonButton from "../Components/Common/CommonButton";
import PageLoader from "../loaders/PageLoader";
import ViewRawMaterials from "../Components/ViewRawMaterials";
import { T } from "../utils/languageTranslator";
import useSelectedItems from "../hooks/useSelectedItems";
const RAW_MATERIAL_COLUMNS = [
  "checkbox",
  T["s_no"],
  T["material_name"],
  T["cost"],
  T["created_at"],
  T["qty_in_stock"],
  T["reorder_level"],
  T["expiration_date"],
  T["last_updated"],
  T["notes"],
  T["action"],
];
const filterFields = [
  {
    type: "select",
    defaultOption: T["select_type"],
    options: TYPE_OPTIONS,
    filterName: "status",
  },
  {
    type: "select",
    defaultOption: T["sort"],
    options: RAW_MATERIALS_SORT_BY,
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
    placeholder: T["search_materials"],
  },
];

const RawMaterials = () => {
  const formConfig = useForm();
  const { reset, watch } = formConfig;
  // const { showModal: showDeleteModal, toggleModal: toggleDeleteModal } =
  //   useModalToggle();
  const [deleteInfo, setDeleteInfo] = useState({
    show: false,
    itemToDelete: null,
    status: "",
  });
  const {
    showModal: showRawMaterialSection,
    toggleModal: toggleRawMaterialSection,
  } = useModalToggle();
  const {
    selectedItems: selectedMaterials,
    setSelectedItems: setSelectedMaterials,
    handleSelectItems: handleSelectMaterials,
    selectAllItems,
  } = useSelectedItems();

  const { pageLoader, toggleLoader, setPageLoader } = useLoader();
  const { page, onPageChange, setPage } = usePagination();
  const [filters, setFilters] = useState({
    status: "all",
    category: "",
    search: "",
    sort_by: "",
    sort: "desc",
  });
  const [editInfo, setEditInfo] = useState({
    isEdit: false,
    item: null,
  });
  const [rawMaterials, setRawMaterials] = useState([]);
  const [totalData, setTotalData] = useState(null);
  const [itemToDelete, setItemToDelete] = useState();
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const [btnLoaders, setbtnLoaders] = useState({
    publish: false,
    draft: false,
  });
  const [viewInfo, setViewInfo] = useState({ show: false, item: null });
  const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState({
    show: false,
    payload: {},
    value: "",
  });
  const [bulkDeleteLoader, setBulkDeleteLoader] = useState(false);
  useEffect(() => {
    fetchRawMaterials();
  }, [page, filters]);

  const fetchRawMaterials = (isAdded = false) => {
    const apiFilters = {
      ...filters,
      page: isAdded ? 1 : page,
    };
    setPageLoader((prev) => true);
    makeApiRequest({
      endPoint: RAW_MATERIAL_ENDPOINT,
      method: METHODS.get,
      params: apiFilters,
      instanceType: INSTANCE?.authorized,
    })
      .then((res) => {
        const response = res?.data;
        setTotalData(response?.count);
        setRawMaterials(response?.results);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setPageLoader((prev) => false);
      });
  };

  const handleActions = ({ action, deleteItem, editItem, viewItem }) => {
    if (action === "view") {
      setViewInfo({ show: true, item: viewItem });
    } else if (action === "edit") {
      setEditInfo({
        isEdit: true,
        item: editItem,
      });
      toggleRawMaterialSection();
    } else {
      const { id, is_deleted } = deleteItem;
      setDeleteInfo({
        show: true,
        itemToDelete: deleteItem,
        status: is_deleted ? "delete" : "trash",
      });
    }
  };
  console.log("delete info", deleteInfo);
  const deleteRawMaterial = () => {
    const { status, itemToDelete } = deleteInfo;
    const isTrash = !itemToDelete?.is_deleted;
    setDeleteLoader((prev) => true);
    //  in case of trash integrate the partch API otherwwise the original delete API
    makeApiRequest({
      endPoint: RAW_MATERIAL_ENDPOINT,
      method: isTrash ? METHODS?.patch : METHODS?.delete,
      instanceType: INSTANCE.authorized,
      delete_id: isTrash ? null : itemToDelete?.id,
      update_id: isTrash ? itemToDelete?.id : null,
      payload: isTrash ? createPayloadForRawMaterial(itemToDelete) : null,
    })
      .then((res) => {
        if (page === 1) {
          fetchRawMaterials();
        } else {
          setPage(1);
        }
        toastMessage(
          `Raw material ${isTrash ? T["moved_to_trash"] : T["deleted"]} successfully`,
          successType
        );
        // setRawMaterials(deleteItemBasedOnId(rawMaterials, itemToDelete));
      })
      .catch((err) => {
        toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
      })
      .finally((res) => {
        setDeleteInfo({
          show: false,
          itemToDelete: null,
          status: "",
        });
        setDeleteLoader((prev) => false);
      });
  };

  const handleFilterChange = (filterName, value) => {
    if (filterName === "action") {
      if (selectedMaterials?.length) {
        const payload = {
          product_material_ids: [...selectedMaterials],
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
        handleBulkAction(payload, value);
      } else {
        toastMessage(handleBulkMessage("raw material"));
      }
    } else {
      let temp = { ...filters };
      if (filterName === "sort_by") {
        if (SORT_VALUES.includes(value)) {
          console.log(value);
          temp["sort"] = value;
          temp["sort_by"] = "";
        } else {
          temp["sort_by"] = removeLeadingDash(value);
          temp["sort"] = getSortValue(value);
        }
      } else {
        temp[filterName] = value;
      }
      if (!searchInput) {
        temp["search"] = "";
      }
      setFilters(temp);
      setPage(1);
    }
  };

  const handleRawMaterialCancel = () => {
    toggleRawMaterialSection();
    setEditInfo({ isEdit: false, item: null });
    reset();
    setViewInfo({ show: false, item: null });
  };

  const handleAddEditRawMaterial = (values, event) => {
    const buttonType = event.nativeEvent.submitter.name;
    handleButtonLoaders(buttonType);
    const payload = {
      ...values,
      quantity: +values?.quantity,
      reorder: +values?.reorder,
      is_active: buttonType === "publish",
      expiry_date: formatDate(values?.expiry_date, YYYY_MM_DD),
    };

    makeApiRequest({
      endPoint: RAW_MATERIAL_ENDPOINT,
      payload: payload,
      method: editInfo?.isEdit ? METHODS?.patch : METHODS.post,
      update_id: editInfo?.isEdit && editInfo?.item?.id,
    })
      .then((res) => {
        toastMessage(
          `Raw product ${editInfo?.isEdit ? T["updated"] : T["added"]} successfully`,
          successType
        );
        fetchRawMaterials(true);
        setbtnLoaders({ publish: false, draft: false });
        handleRawMaterialCancel();
        setPage(1);
      })
      .catch((err) => {
        toastMessage(err?.response?.data?.name?.[0] || DEFAULT_ERROR_MESSAGE);
        if (!err?.response?.data?.name?.[0]) {
          handleRawMaterialCancel();
          setPage(1);
        }
      })
      .finally(() => {
        setbtnLoaders({ publish: false, draft: false });
      });
  };
  const handleButtonLoaders = (type) => {
    setbtnLoaders({ ...btnLoaders, [type]: !btnLoaders[type] });
  };
  const handleConfirmationCancel = () => {
    setConfirmationInfo({ show: false });
  };

  const handleBulkAction = (payload, value) => {
    bulkActionMaterial(payload)
      .then((res) => {
        toastMessage(
          `${T["raw_materials"]} ${actionToText[value]} ${T["successfully"]}`,
          successType
        );
      })
      .catch((err) => {
        toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
        setPage(1);
      })
      .finally(() => {
        setFilters({ ...filters, action: "" });
        setSelectedMaterials([]);
      });
  };
  const bulkDeleteRawMaterial = () => {
    setBulkDeleteLoader((prev) => true);
    const payload = bulkDeleteConfirmation?.payload;
    const value = bulkDeleteConfirmation?.value;
    console.log(payload, value, "this is payload and value");
    bulkActionMaterial(payload)
      .then((res) => {
        toastMessage(
          `${T["raw_materials"]} ${actionToText[value]} ${T["successfully"]}`,
          successType
        );
      })
      .catch((err) => {
        toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
        setPage(1);
      })
      .finally(() => {
        setFilters({ ...filters, action: "" });
        setSelectedMaterials([]);
        setBulkDeleteLoader((prev) => false);
        setBulkDeleteConfirmation({ show: false, payload: {}, value: "" });
      });
  };
  return (
    <>
      {pageLoader && <PageLoader />}
      <FilterSection
        filterFields={filterFields}
        handleFilterChange={handleFilterChange}
        filters={filters}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
      >
        <CommonButton
          text="Add Raw Material"
          className="orange_btn"
          onClick={toggleRawMaterialSection}
        />
      </FilterSection>
      <TableWrapper
        columns={RAW_MATERIAL_COLUMNS}
        onCheckboxChange={(e) => {
          selectAllItems(e, rawMaterials);
        }}
        checked={
          rawMaterials?.length &&
          rawMaterials?.length === selectedMaterials?.length
        }
      >
        {rawMaterials?.length ? (
          rawMaterials?.map((it, idx) => (
            <SingleRawMaterialRow
              key={idx}
              item={it}
              index={idx}
              currentPage={page}
              handleActions={handleActions}
              selectedMaterials={selectedMaterials}
              handleSelectMaterials={handleSelectMaterials}
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

      {deleteInfo?.show && (
        <DeleteConfirmationModal
          title={createDeleteConfirmationTitle(
            "raw_material",
            deleteInfo?.status
          )}
          description={createDeleteConfirmationDescription(
            "raw_material",
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
          onDelete={deleteRawMaterial}
        />
      )}

      {bulkDeleteConfirmation?.show && (
        <DeleteConfirmationModal
          title={BULK_DELETE_TITLE}
          description={BULK_RAW_MATERIAL_DELETE_DESCRIPTION}
          onCancel={() => {
            setBulkDeleteConfirmation({ show: false, payload: {}, value: "" });
          }}
          loader={bulkDeleteLoader}
          onDelete={bulkDeleteRawMaterial}
        />
      )}

      {showRawMaterialSection && (
        <AddEditRawMaterial
          formConfig={formConfig}
          onClose={handleRawMaterialCancel}
          onSubmit={handleAddEditRawMaterial}
          editInfo={editInfo}
          btnLoaders={btnLoaders}
        />
      )}
      {viewInfo?.show && (
        <ViewRawMaterials
          item={viewInfo?.item}
          onClose={() => {
            setViewInfo({ show: false, item: null });
            reset();
          }}
          formConfig={formConfig}
        />
      )}
    </>
  );
};

export default RawMaterials;
