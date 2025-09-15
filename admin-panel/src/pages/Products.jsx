import React, { useEffect, useState } from "react";
import FilterSection from "../Components/Common/FilterSection";
import {
  bulkActionProduct,
  deleteProduct,
  getProducts,
  INSTANCE,
  makeApiRequest,
  METHODS,
} from "../api/apiFunctions";
import usePagination from "../hooks/usePagination";
import Pagination from "../Components/Common/Pagination";
import {
  DEFAULT_ERROR_MESSAGE,
  ITEMS_PER_PAGE,
  ACTIONS,
  TYPE_OPTIONS,
  PRODUCTS_SORT_BY,
  UPDATE_DESCRIPTION_TEXT,
  BULK_DELETE_TITLE,
  BULK_RAW_MATERIAL_DELETE_DESCRIPTION,
  BULK_PRODUCT_DELETE_DESCRIPTION,
} from "../constant";
import CommonButton from "../Components/Common/CommonButton";
import useModalToggle from "../hooks/useModalToggle";
import DeleteConfirmationModal from "../Modals/DeleteConfirmationModal";
import { trashIcon } from "../assets/Icons/Svg";
import { successType, toastMessage } from "../utils/toastMessage";
import "react-toastify/dist/ReactToastify.css";
import useLoader from "../hooks/useLoader";
import PageLoader from "../loaders/PageLoader";
import NoDataFound from "../Components/Common/NoDataFound";
import { useNavigate } from "react-router-dom";
import TableWrapper from "../Wrappers/TableWrapper";
import { createDeleteConfirmationDescription, createDeleteConfirmationTitle, createPayloadForProduct, createProductSeo, deleteItemBasedOnId } from "../utils/helpers";
import SingleProductTableRow from "../Components/SingleProductTableRow";
import { T } from "../utils/languageTranslator";
import useSelectedItems from "../hooks/useSelectedItems";
import { PRODUCT_ENDPOINT } from "../api/endpoints";
import ChangeStatusModal from "../Components/Common/ChangeStatusModal";

const PRODUCT_PAGE_COLUMNS = [
  "checkbox",
  T["s_no"],
  T["name"],
  T["sku"],
  T["stock"],
  T["price"],
  T["category"],
  T["added_on"],
  T["action"],
  "",
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
    defaultOption: "Sort By",
    options: PRODUCTS_SORT_BY,
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
    placeholder: T["search_product"],
  },
];
const Products = () => {
  const navigate = useNavigate();
  const { page, onPageChange, setPage } = usePagination();
  const { showModal, toggleModal } = useModalToggle();
  const { pageLoader, toggleLoader, setPageLoader } = useLoader();
  const {
    selectedItems: selectedProducts,
    setSelectedItems: setSelectedProducts,
    handleSelectItems: handleSelectProduct,
    selectAllItems,
  } = useSelectedItems();
  const [products, setProducts] = useState([]);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [totalData, setTotalData] = useState();
  const [buttonLoader, setButtonLoader] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    category: "",
    action: "",
    search: "",
    sort_by: "",
  });
  const [searchInput, setSearchInput] = useState("");
  const [statusChangeInfo, setStatusChangeInfo] = useState({
    show: false,
    id: null,
    status: "",
  });
  const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState({
    show: false,
    payload: {},
    value: "",
  });

    const [deleteInfo, setDeleteInfo] = useState({
      show: false,
      itemToDelete: null,
      status: "",
    });
  

  const [bulkDeleteLoader, setBulkDeleteLoader] = useState(false);


  useEffect(() => {
    fetchProducts();
  }, [page, filters]);
  const fetchProducts = async () => {
    const apiFilters = {
      ...filters,
      page: page,
    };
    setPageLoader((prev) => true);
    getProducts(apiFilters)
      .then((res) => {
        setProducts(res?.data?.results);
        setTotalData(res?.data?.count);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setPageLoader((prev) => false);
      });
  };
  const handleFilterChange = (filterName, value) => {
    if (filterName === "action") {
      const payload = {
        products: selectedProducts,
        status: value,
      };
      if (selectedProducts?.length) {
        if (value == "delete") {
          setBulkDeleteConfirmation({
            show: true,
            payload: { ...payload },
            value: value,
          });
          return;
        }

        toggleLoader("pageLoader");
        bulkActionProduct(payload)
          .then((res) => {
            // fetchProducts({ ...apiFilters });
            toastMessage(
              res?.data?.message ||
              `Products ${value === "Deleted" ? "deleted" : "Drafted"
              } successfully`,
              successType
            );
          })
          .catch((err) => {
            console.log(err, "this is err");
            toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
          })
          .finally(() => {
            toggleLoader("pageLoader");
            setPage(1);
            setSelectedProducts([]);
            setFilters({ ...filters, ["action"]: "" });
          });
      } else {
        toastMessage(
          "Please select at least one product to perform any action"
        );
      }
    } else {
      let temp = { ...filters };
      temp[filterName] = value;
      if (!searchInput) {
        temp["search"] = "";
      }
      setFilters(temp);
    }
  };
  const handleCategoryClick = () => {
    navigate("/categories");
  };
  const handleDeleteProduct = () => {
    const { status, itemToDelete } = deleteInfo;
    const isTrash = !itemToDelete?.is_deleted;
    setDeleteLoader((prev) => true);
    // deleteProduct(itemToDelete)
    makeApiRequest({
      endPoint:PRODUCT_ENDPOINT,
      method: isTrash ? METHODS.patch : METHODS.delete,
      instanceType:isTrash ?INSTANCE?.formInstance :INSTANCE.authorized,
      delete_id: isTrash ? null : itemToDelete?.id,
      update_id: isTrash ? itemToDelete?.id : null,
      payload: isTrash ? createPayloadForProduct(itemToDelete) : null,
    })
      .then((res) => {
        toastMessage(`Product ${isTrash ? "moved to trash" : "deleted"} successfully`, successType);
        fetchProducts();
        setPage(1);
        // setProducts(deleteItemBasedOnId(products, itemToDelete));
      })
      .catch((err) => {
        toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
      })
      .finally(() => {
        setDeleteInfo({
          show: false,
          itemToDelete: null,
          status: "",
        });
        // toggleModal();
        // setItemToDelete(null);
        setDeleteLoader((prev) => false);
      });
  };

  const handleActions = (action, id, deleteItem=null) => {
    if (action === "view") {
      navigate("/view-product", { state: { id: id, isViewOnly: true } });
    } else if (action === "edit") {
      // update required: make the route name better
      navigate("/add-edit-product", { state: { id: id } });
    } else if (action === "delete") {
      const { id, is_deleted } = deleteItem;
      setDeleteInfo({
        show: true,
        itemToDelete: deleteItem,
        status: is_deleted ? "delete" : "trash",
      });

      // toggleModal();
      // setItemToDelete(id);
    }
  };
  const changeStatus = () => {
    const { status, id } = statusChangeInfo;
    setButtonLoader((prev) => true);
    const payload = {
      products: [id],
      status: status,
    };
    bulkActionProduct(payload)
      .then((res) => {
        toastMessage(T["status_updated_successfully"], successType);
        fetchProducts();
      })
      .catch((err) => {
        console.log(err?.response?.data);
        toastMessage(err?.response?.data || DEFAULT_ERROR_MESSAGE);
      })
      .finally(() => {
        setPageLoader((prev) => false);
        handleStatusCancel();
      });
  };

  const handleStatusCancel = () => {
    setStatusChangeInfo({
      status: "",
      show: false,
      id: null,
    });
    setButtonLoader((prev) => false);
  };

  const bulkDeleteProduct = () => {
    setBulkDeleteLoader((prev) => true);
    const payload = bulkDeleteConfirmation?.payload;
    const value = bulkDeleteConfirmation?.value;
    bulkActionProduct(payload)
      .then((res) => {
        toastMessage(
          res?.data?.message ||
          T["products_deleted_successfully"],
          successType
        );
      })
      .catch((err) => {
        console.log(err, "this is err");
        toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
      })
      .finally(() => {
        setBulkDeleteConfirmation({ show: false, payload: {}, value: "" });
        setBulkDeleteLoader((prev) => true);
        setPage(1);
        setSelectedProducts([]);
        setFilters({ ...filters, ["action"]: "" });
      });
  }
  return (
    <>
      {pageLoader && <PageLoader />}
      <div>
        <FilterSection
          filterFields={filterFields}
          handleFilterChange={handleFilterChange}
          filters={filters}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          isProduct={true}
        >
          <CommonButton
            text={T["categories"]}
            onClick={() => navigate("/categories")}
            type="button"
            className="grey_btn"
          />
          <CommonButton
            text={T["add_new_product"]}
            onClick={() => navigate("/add-edit-product")}
            type="button"
            className="orange_btn"
          />
        </FilterSection>
        {/* product listing */}
        <TableWrapper
          columns={PRODUCT_PAGE_COLUMNS}
          onCheckboxChange={(e) => {
            selectAllItems(e, products);
          }}
          checked={
            products?.length && products?.length === selectedProducts?.length
          }
        >
          {products?.length ? (
            products?.map((dt, idx) => (
              <SingleProductTableRow
                key={idx}
                data={dt}
                currentPage={page}
                index={idx}
                handleActions={handleActions}
                selectedProducts={selectedProducts}
                handleSelectProduct={handleSelectProduct}
                handleProductStatusChange={(item, status) => {
                  setStatusChangeInfo({
                    show: true,
                    id: item?.id,
                    status: status,
                  });
                }}
              />
            ))
          ) : (
            // updates required:Create a better no data found component
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
      {/* {showModal && (
        <DeleteConfirmationModal
          icon={trashIcon}
          title="Are you sure you want to delete this product?"
          description="This action cannot be redo. Deleting this product will permanently remove it from your inventory, and it will no longer be available for purchase."
          onCancel={() => {
            setItemToDelete(null);
            toggleModal();
          }}
          onDelete={handleDeleteProduct}
          loader={deleteLoader}
        />
      )} */}
       {deleteInfo?.show && (
        <DeleteConfirmationModal
          title={createDeleteConfirmationTitle(
            "product",
            deleteInfo?.status
          )}        
          deleteText={deleteInfo?.status === "delete" ? "delete" : "move_to_trash"}
          description={createDeleteConfirmationDescription(
            "product",
            deleteInfo?.status
          )}
          onCancel={() => {
            setDeleteInfo({
              show: false,
              itemToDelete: null,
              status: "",
            });
          }}
          
          loader={deleteLoader}
          onDelete={handleDeleteProduct}
        />
      )}

      {bulkDeleteConfirmation?.show && (
        <DeleteConfirmationModal
          title={BULK_DELETE_TITLE}
          description={BULK_PRODUCT_DELETE_DESCRIPTION}
          onCancel={() => {
            setBulkDeleteConfirmation({ show: false, payload: {}, value: "" });
          }}
          loader={bulkDeleteLoader}
          onDelete={bulkDeleteProduct}
        />
      )}

      {statusChangeInfo?.show && (
        <ChangeStatusModal
          description={
            T["this_action_will_update_the_status_of_the_product_and_cannot_be_undone"]
          }
          onStatusChange={changeStatus}
          loader={buttonLoader}
          onCancel={handleStatusCancel}
        >
          <p>
            {T["are_you_sure_you_want_to_update_status_to"]}
            <span className="capitalize">{statusChangeInfo?.status}</span>
          </p>
        </ChangeStatusModal>
      )}
    </>
  );
};

export default Products;
