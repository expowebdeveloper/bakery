import React, { useEffect, useState } from "react";
import usePagination from "../hooks/usePagination";
import { makeApiRequest, METHODS } from "../api/apiFunctions";
import useLoader from "../hooks/useLoader";
import {
  GET_INVENTORY_ENDPOINT,
  PRINT_ORDER_NUMBER,
  UPDATE_STOCK_ENDPOINT,
} from "../api/endpoints";
import FilterSection from "../Components/Common/FilterSection";
import {
  DEFAULT_ERROR_MESSAGE,
  INVENTORY_PAGE_COLUMNS,
  INVENTORY_SORT_BY,
  INVENTORY_STATUS_OPTIONS,
  ITEMS_PER_PAGE,
  SORT_BY_OPTIONS,
} from "../constant";
import NoDataFound from "../Components/Common/NoDataFound";
import TableWrapper from "../Wrappers/TableWrapper";
import Pagination from "../Components/Common/Pagination";
import SingleInventoryRow from "../Components/SingleInventoryRow";
import useModalToggle from "../hooks/useModalToggle";
import { useForm } from "react-hook-form";
import AddEditInventory from "../Components/Common/AddEditInventory";
import {
  deleteItemBasedOnId,
  handlePrintPdf,
  handleViewPdf,
} from "../utils/helpers";
import { successType, toastMessage } from "../utils/toastMessage";
import DeleteConfirmationModal from "../Modals/DeleteConfirmationModal";
import { T } from "../utils/languageTranslator";
import PageLoader from "../loaders/PageLoader";
const filterFields = [
  {
    type: "select",
    defaultOption: T["all"],
    options: INVENTORY_STATUS_OPTIONS,
    filterName: "status",
  },
  {
    type: "select",
    defaultOption: T["sort_by"],
    options: INVENTORY_SORT_BY,
    filterName: "sort_by",
  },
  {
    type: "search",
    filterName: "search",
    placeholder: T["search_inventory"],
  },
];

const InventoryManagement = () => {
  const formConfig = useForm();
  const { reset } = formConfig;
  const { page, onPageChange, setPage } = usePagination();
  const { pageLoader, toggleLoader, setPageLoader } = useLoader();
  const [barcodeLoader, setBarcodeLoader] = useState(false);
  const [printLoader, setPrintLoader] = useState(null);
  const { showModal: showInventorySection, toggleModal: toggleInventory } =
    useModalToggle();
  const { showModal: showDeleteModal, toggleModal: toggleDeleteModal } =
    useModalToggle();
  const [inventories, setInventories] = useState([]);
  const [totalData, setTotalData] = useState(null);
  const [editInfo, setEditInfo] = useState({
    isEdit: false,
    editItem: null,
  });
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [btnLoaders, setbtnLoaders] = useState({
    inventory: false,
    print: false,
  });
  const [itemToDelete, setItemToDelete] = useState();
  const [filters, setFilters] = useState({
    sort_by: "",
    search: "",
    status: "",
  });
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    fetchInventory();
  }, [page, filters]);
  // console.log(inventories, "inventories");

  const fetchInventory = () => {
    setPageLoader((prev) => true);
    const apiParams = {
      ...filters,
      page: page,
    };
    makeApiRequest({
      endPoint: GET_INVENTORY_ENDPOINT,
      params: apiParams,
      method: METHODS.get,
    })
      .then((res) => {
        setInventories(res?.data?.results);
        setTotalData(res?.data?.count);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setPageLoader((prev) => false);
      });
  };

  const handleFilterChange = (filterName, value) => {
    const temp = { ...filters };
    temp[filterName] = value;
    setFilters(temp);
    setPage(1);
  };

  const handleActions = ({ action, deleteId, editItem, viewItem }) => {
    if (action === "edit") {
      setEditInfo({
        isEdit: true,
        item: editItem,
      });
      toggleInventory();
    } else {
      // for delete
      setItemToDelete(deleteId);
      toggleDeleteModal();
    }
  };

  const handleInventorySection = ({ action }) => {
    if (action === "open") {
      toggleInventory();
    } else if (action === "close") {
      toggleInventory();
      setPage(1);
      reset();
    }
  };

  const handleInventoryCancel = () => {
    toggleInventory();
    setEditInfo({ isEdit: false, item: null });
    reset(); // for resetting form values
  };

  const onSubmit = (values, event) => {
    const buttonType = event.nativeEvent.submitter.name; //contains invenory and print
    const itemStatus = editInfo?.item?.status;
    const editItem = editInfo?.item;
    console.log(editItem, "editItem");
    console.log(itemStatus, "itemStatus");
    handleButtonLoaders(buttonType);
    const payload = {
      name: values?.name,
      sku: values?.sku,
      quantity: +values?.quantity,
      start_from: +values?.barcode_from,
      end_from: +values?.barcode_to,
      status: itemStatus,
    };
    if (buttonType === "print") {
      const params = {
        sku: editItem?.sku,
      };
      printOrderNumber(params);
      // makeApiRequest({
      //   endPoint: `${PRINT_ORDER_NUMBER}`,
      //   method: METHODS?.get,
      //   params: params,
      // })
      //   .then((res) => {
      //     handlePrintPdf(res?.data?.barcode_url);
      //   })
      //   .catch((err) => {})
      //   .finally(() => {
      //     setbtnLoaders({ inventory: false, print: false });
      //   });
    } else {
      makeApiRequest({
        endPoint: UPDATE_STOCK_ENDPOINT,
        payload: payload,
        method: METHODS?.put,
        // update_id: editInfo?.isEdit && editInfo?.item?.id,
      })
        .then((res) => {
          toastMessage(`Stocks added successfully`, successType);
          handleInventoryCancel();
          // setPage(1);
          fetchInventory();

          // commented for future use
          // toastMessage(
          //   `Inventory ${editInfo?.isEdit ? "updated" : "added"} successfully`,
          //   successType
          // );
          // if (editInfo?.isEdit) {
          //   setInventories(handleEdit(inventories, editInfo?.item?.id, res?.data));
          // } else {
          //   setInventories((prev) => [...prev, res?.data]);
          // }
        })
        .catch((err) => {
          toastMessage(err?.response?.data?.name?.[0] || DEFAULT_ERROR_MESSAGE);
          if (!err?.response?.data?.name?.[0]) {
            handleInventoryCancel();
            setPage(1);
          }
        })
        .finally(() => {
          setbtnLoaders({ inventory: false, print: false });
        });
    }
  };

  const handleButtonLoaders = (type) => {
    setbtnLoaders({ ...btnLoaders, [type]: !btnLoaders[type] });
  };

  const deleteInventory = () => {
    // setDeleteLoader((prev) => true);
    // makeApiRequest({
    //   endPoint: INVENTORY_ENDPOINT,
    //   method: METHODS?.delete,
    //   instanceType: INSTANCE.authorized,
    //   delete_id: itemToDelete,
    // })
    //   .then((res) => {
    //     toastMessage("Inventory deleted successfully", successType);
    //     setInventories(deleteItemBasedOnId(inventories, itemToDelete));
    //   })
    //   .catch((err) => {
    //     toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
    //   })
    //   .finally((res) => {
    //     toggleDeleteModal();
    //     setDeleteLoader((prev) => false);
    //   });
  };
  const printOrderNumber = (params, type = "print", index) => {
    if (type === "view") {
      setBarcodeLoader(index);
    } else {
      setPrintLoader(index);
    }
    makeApiRequest({
      endPoint: `${PRINT_ORDER_NUMBER}`,
      method: METHODS?.get,
      params: params,
    })
      .then((res) => {
        if (type === "print") {
          handlePrintPdf(res?.data?.barcode_url);
        } else {
          handleViewPdf(res?.data?.barcode_url);
        }
      })
      .catch((err) => {
        console.log(err?.response);
      })
      .finally(() => {
        setbtnLoaders({ inventory: false, print: false });
        if (type === "view") {
          setBarcodeLoader(null);
        } else {
          setPrintLoader(null);
        }
      });
  };

  return (
    <div>
      {pageLoader && <PageLoader />}{" "}
      <FilterSection
        filterFields={filterFields}
        handleFilterChange={handleFilterChange}
        filters={filters}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
      >
        {/* <CommonButton
          text="Add Inventory"
          className="orange_btn"
          onClick={() => {
            handleInventorySection({ action: "open" });
          }}
        /> */}
      </FilterSection>
      <TableWrapper columns={INVENTORY_PAGE_COLUMNS}>
        {inventories?.length ? (
          inventories?.map((it, idx) => (
            <SingleInventoryRow
              key={idx}
              item={it}
              currentPage={page}
              index={idx}
              handleActions={handleActions}
              handleViewBarcode={(sku) => {
                const params = {
                  sku: sku,
                };
                printOrderNumber(params, "view", idx);
              }}
              barcodeLoader={barcodeLoader}
              printLoader={printLoader}
              handlePrintBarcode={(sku) => {
                const params = {
                  sku: sku,
                };
                printOrderNumber(params, "print", idx);
              }}
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
      {showInventorySection && (
        <AddEditInventory
          formConfig={formConfig}
          // onClose={() => {
          //   handleInventorySection({ action: "close" });
          // }}
          onClose={handleInventoryCancel}
          editInfo={editInfo}
          onSubmit={onSubmit}
          btnLoaders={btnLoaders}
        />
      )}
      {showDeleteModal && (
        <DeleteConfirmationModal
          title="Are you sure you want to delete this inventory?"
          description="This action cannot be redo."
          onCancel={() => {
            setItemToDelete(null);
            toggleDeleteModal();
          }}
          loader={deleteLoader}
          onDelete={deleteInventory}
        />
      )}
    </div>
  );
};

export default InventoryManagement;
