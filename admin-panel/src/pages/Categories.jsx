import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  bulkActionCategories,
  bulkActionDiscount,
  INSTANCE,
  makeApiRequest,
  METHODS,
} from "../api/apiFunctions";
import { CATEGORIES_ENDPOINT, SUBCATEGORY_ENDPOINT } from "../api/endpoints";
import { successType, toastMessage } from "../utils/toastMessage";
import {
  ACTIONS,
  BULK_CATEGORY_DELETE_DESCRIPTION,
  BULK_DELETE_TITLE,
  CATEGORIES_SORT_BY,
  DEFAULT_ERROR_MESSAGE,
  ITEMS_PER_PAGE,
  OPTIONS,
  SORT_VALUES,
  TYPE_OPTIONS,
} from "../constant";
import useLoader from "../hooks/useLoader";
import usePagination from "../hooks/usePagination";
import TableWrapper from "../Wrappers/TableWrapper";
import NoDataFound from "../Components/Common/NoDataFound";
import SingleCategoryRow from "../Components/Common/SingleCategoryRow";
import useModalToggle from "../hooks/useModalToggle";
import DeleteConfirmationModal from "../Modals/DeleteConfirmationModal";
import Pagination from "../Components/Common/Pagination";
import {
  actionToText,
  completeLength,
  createCategoryPayload,
  createDeleteConfirmationDescription,
  createDeleteConfirmationTitle,
  deleteItemBasedOnId,
  getSortValue,
  handleEdit,
  removeLeadingDash,
} from "../utils/helpers";
import FilterSection from "../Components/Common/FilterSection";
import CommonButton from "../Components/Common/CommonButton";
import AddEditCategorySection from "../Components/AddEditCategorySection";
import PageLoader from "../loaders/PageLoader";
import useSelectedItems from "../hooks/useSelectedItems";
const CATEGORY_PAGE_COLUMNS = [
  "checkbox",
  "Image", // for image section
  "Name",
  "Slug",
  "Description",
  "Added On",
  // "Parent Category",
  "Product Count",
  "Actions",

  // this extra space is for the hamburger menu ,
  // "",
];
const DEFAULT_CATEGORY_VALUES = {
  name: "",
  description: "",
  parent_category: "",
  image: "",
};

const filterFields = [
  {
    type: "select",
    defaultOption: "Select type",
    options: TYPE_OPTIONS,
    filterName: "status",
  },
  {
    type: "select",
    defaultOption: "Sort By",
    options: CATEGORIES_SORT_BY,
    filterName: "sort_by",
  },
  {
    type: "select",
    defaultOption: "Select Action",
    options: ACTIONS,
    filterName: "action",
  },
  {
    type: "search",
    filterName: "search",
    placeholder: "Search Categories",
  },
];

const Categories = () => {
  const formConfig = useForm({
    defaultValues: DEFAULT_CATEGORY_VALUES,
  });
  const { showModal, toggleModal } = useModalToggle();
  const { page, onPageChange, setPage } = usePagination();
  const categoryModal = useModalToggle();
  const { pageLoader, toggleLoader, setPageLoader } = useLoader();

  const { reset, setValue } = formConfig;
  const [bulkDeleteLoader, setBulkDeleteLoader] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState({
    show: false,
    itemToDelete: null,
    status: "",
    type:""
  });

  const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState({
    show: false,
    payload: {},
    value: "",
  });

  const [filters, setFilters] = useState({
    status: "all",
    action: "",
    search: "",
    sort_by: "",
  });
  const [searchInput, setSearchInput] = useState("");
  const [file, setFile] = useState({
    file: null,
    preview: "",
    error: "",
  });
  const [categories, setCategories] = useState([]);
  const [itemToDelete, setItemToDelete] = useState({
    id: null,
    type: "", // for checking whether to delete category or subcategory
  });
  const [totalData, setTotalData] = useState();
  const [editCategoryInfo, setEditCategoryInfo] = useState({
    isEdit: false,
    editItem: null,
    type: "", // for managing whether to edit category or subcategory
  });
  const [btnLoaders, setBtnLoaders] = useState({
    publish: false,
    draft: false,
  });

  const [deleteLoader, setDeleteLoader] = useState(false);
  const [selectedItems, setSelectedItems] = useState({
    categories: [],
    subCategories: [],
  });

  // for delete confirmation modal
  // const {
  //   selectedItems: selectedCategories,
  //   setSelectedItems: setSelectedCategories,
  //   handleSelectItems: handleSelectedCategories,
  //   selectAllItems,
  // } = useSelectedItems();
  // categories section include some different logic so that's why not using the custom hook for handling bulk API integration

  // for add and edit category modal

  useEffect(() => {
    fetchData();
  }, [page, filters]);

  const fetchData = (isAdded = false) => {
    setPageLoader((prev) => true);
    const apiFilters = {
      ...filters,
      page: isAdded ? 1 : page,
    };
    makeApiRequest({
      endPoint: CATEGORIES_ENDPOINT,
      method: METHODS.get,
      params: apiFilters,
      instanceType: INSTANCE.authorized,
    })
      .then((res) => {
        setTotalData(res?.data?.count);
        setCategories(res?.data?.results);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setPageLoader((prev) => false));
  };

  const handleActions = ({ action, editItem, deleteId,deleteItem, type }) => {
    if (action === "edit") {
      categoryModal?.toggleModal();
      setEditCategoryInfo({ isEdit: true, item: editItem, type: type });
    } else if (action === "delete") {
      const { id, is_deleted } = deleteItem;
      console.log(deleteItem, "this is delete item");
      setDeleteInfo({
        show: true,
        itemToDelete: deleteItem,
        status: is_deleted ? "delete" : "trash",
        type:type
      });

      // setItemToDelete({ id: deleteId, type: type });
      // toggleModal();
    }
  };

  const handleDeleteCategory = () => {
    const { status, itemToDelete ,type} = deleteInfo;
    const isTrash = !itemToDelete?.is_deleted;
    setDeleteLoader((prev) => true);
    makeApiRequest({
      endPoint:
      type === "category"
          ? CATEGORIES_ENDPOINT
          : SUBCATEGORY_ENDPOINT,

      method:isTrash ? METHODS?.patch : METHODS.delete,
      instanceType: isTrash ? INSTANCE.formInstance : INSTANCE.authorized,
      delete_id: isTrash ? null: itemToDelete?.id,
      update_id: isTrash ? itemToDelete?.id : null,
      payload: isTrash ? createCategoryPayload() :null})
      .then((res) => {
        if (res.status === 204 || res.status === 200) {
          toastMessage(
            `${itemToDelete.type === "category" ? "Category" : "Subcategory"
            } ${isTrash ?"moved to trash" :"deleted"} Successfully`,
            successType
          );
          // fetchData();
          if (page === 1) {
            fetchData();
          } else {
            setPage(1);
          }
          // Update the categories or subcategories
        } else {
          throw new Error("Unexpected response");
        }
      })
      .catch((err) => {
        toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
      })
      .finally(() => {
        setDeleteLoader((prev) => false);
        // toggleModal();
        setDeleteInfo({
          show: false,
          itemToDelete: null,
          status: "",
          type: "",
        });
        setItemToDelete({ id: null, type: "" });
        setPage(1);
      });
  };

  // const handleFilterChange = (filterName, value) => {
  //   const temp = { ...filters };
  //   temp[filterName] = value;
  //   setFilters(temp);
  // };

  const handleFilterChange = (filterName, value) => {
    if (filterName === "action") {
      if (
        !selectedItems?.categories?.length &&
        !selectedItems?.subCategories?.length
      ) {
        toastMessage(
          "Please select at least one category or subcategory before performing any action"
        );
      } else {
        // logic for bulk action
        const payload = {
          categories: [...selectedItems?.categories],
          sub_categories: [...selectedItems?.subCategories],
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

        bulkActionCategories(payload)
          .then((res) => {
            toastMessage(`${actionToText[value]} successfully`, successType);
            setFilters({ ...filters, action: "" });
          })
          .catch((err) => {
            toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
            setPage(1);
          })
          .finally(() => {
            setSelectedItems({
              categories: [],
              subCategories: [],
            });
            setPageLoader((prev) => false);
          });
      }
    } else {
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
      if (!searchInput) {
        temp["search"] = "";
      }

      setFilters(temp);
      setPage(1);
    }
  };

  const handleCategoryModal = ({ action }) => {
    if (action === "open") {
      categoryModal?.toggleModal();
    } else if (action === "close") {
      reset();
      setEditCategoryInfo({ isEdit: false, item: null, type: "" });
      setItemToDelete({ id: null, type: "" });
      setFile({ preview: "", file: null, error: "" });
      setPage(1);
      categoryModal?.toggleModal();
      setValue("category_image", null);
    }
  };

  const handleAddEditCategory = (values, event) => {
    // if (file?.error) {
    //   return;
    // }
    const { isEdit, item, type } = editCategoryInfo;
    const buttonType = event.nativeEvent.submitter.name;

    handleButtonLoaders(buttonType);
    // const payload = {
    //   ...values,
    //   is_active: buttonType === "publish",
    // };
    const payload = {
      name: values.name,
      // slug: values.slug,
      description: values.description,
      is_active: buttonType === "publish",
      // slug: "static-slug",
    };
    delete payload.image;
    // converting payload into form data
    const formData = new FormData();

    for (let key in payload) {
      formData.append(key, payload[key]);
    }
    // appending file
    console.log(file, "this is file ");
    if (file?.file) {
      formData.append("category_image", file.file);
    } else if (!file?.file && !file?.preview) {
      formData.append("category_image", "");
    }
    if (values?.parent) {
      formData.append("parent", values.parent?.value);
    }

    const data = Object.fromEntries(formData.entries()); // Convert to object
    const isSubCategory = values?.parent;
    makeApiRequest({
      endPoint: manageApiEndpoint(),
      method: isEdit ? METHODS?.patch : METHODS?.post,
      update_id: isEdit && item?.id,
      payload: formData,
      instanceType: INSTANCE.formInstance,
    })
      .then((res) => {
        toastMessage(
          `${isSubCategory
            ? "Subcategory"
            : type === "subcategory"
              ? "Subcategory"
              : "Category"
          } ${isEdit ? "updated" : "added"} sucessfully`,
          successType
        );
        fetchData(true);
        setBtnLoaders({ publish: false, draft: false });
        handleCategoryModal({ action: "close" });
        reset();
        setFile(null);
        setPage(1);
      })
      .catch((err) => {
        const fieldError =
          err?.response?.data?.name?.[0] || err?.response?.data?.slug?.[0];
        if (fieldError) {
          toastMessage(fieldError);
        } else {
          toastMessage(handleCategoryErrorToast(err));
          fetchData();
          handleCategoryModal({ action: "close" });
          reset();
          setFile(null);
        }
        setBtnLoaders({ publish: false, draft: false });
      });
  };

  const handleCategoryErrorToast = (err) => {
    if (err?.response?.data?.name?.[0]) {
      return err?.response?.data?.name?.[0];
    } else if (err?.response?.data?.slug?.[0]) {
      return err?.response?.data?.slug?.[0];
    } else {
      return DEFAULT_ERROR_MESSAGE;
    }
  };
  const handleButtonLoaders = (type) => {
    setBtnLoaders({ ...btnLoaders, [type]: !btnLoaders[type] });
  };

  const manageApiEndpoint = () => {
    if (editCategoryInfo?.isEdit) {
      if (editCategoryInfo?.type === "category") {
        return CATEGORIES_ENDPOINT;
      } else {
        return SUBCATEGORY_ENDPOINT;
      }
    } else {
      return CATEGORIES_ENDPOINT;
    }
  };

  // commented for future use
  // const handleSelectItems = (id, type) => {
  //   console.log("inside item", id, type);
  //   if (type === "category") {
  //     let temp = { ...selectedItems };
  //     let categories = [...temp?.categories];
  //     if (categories?.includes(id)) {
  //       categories = categories?.filter((el) => el !== id);
  //     } else {
  //       categories = [...categories, id];
  //     }
  //     temp.categories = [...categories];
  //     setSelectedItems(temp);
  //     console.log(temp, "temp");
  //   } else {
  //     let temp = { ...selectedItems };
  //     let subCategories = [...temp?.subCategories];
  //     if (subCategories?.includes(id)) {
  //       subCategories = subCategories?.filter((el) => el !== id);
  //     } else {
  //       subCategories = [...subCategories, id];
  //     }
  //     temp.subCategories = [...subCategories];
  //     setSelectedItems(temp);
  //   }
  // };

  // cat/subcat selection logic
  const handleSelectItems = (id, type) => {
    setSelectedItems((prev) => {
      const updatedItems = { ...prev };
      const key = type === "category" ? "categories" : "subCategories";

      // Toggle the ID in the respective array
      updatedItems[key] = updatedItems[key].includes(id)
        ? updatedItems[key].filter((el) => el !== id)
        : [...updatedItems[key], id];

      return updatedItems;
    });
  };
  const selectAllItems = (e) => {
    const { checked } = e.target;
    let tempCategories = [];
    let tempSubCategories = [];
    if (checked) {
      categories?.forEach((elem) => {
        tempCategories?.push(elem?.id);
        elem?.subcategories?.map((subcat) => {
          tempSubCategories?.push(subcat?.id);
        });
      });
    }
    const result = {
      categories: [...tempCategories],
      subCategories: [...tempSubCategories],
    };
    setSelectedItems(result);
  };
  const isSelectAllChecked = () => {
    if (
      selectedItems?.categories?.length &&
      selectedItems?.subCategories?.length
    ) {
      return (
        completeLength(categories) ==
        selectedItems?.categories?.length + selectedItems?.subCategories?.length
      );
    }
    return false;
  };

  const bulkDeleteCategory = () => {
    setBulkDeleteLoader((prev) => true);
    const payload = bulkDeleteConfirmation?.payload;
    const value = bulkDeleteConfirmation?.value;
    bulkActionCategories(payload)
      .then((res) => {
        toastMessage(`Deleted successfully`, successType);
        setFilters({ ...filters, action: "" });
      })
      .catch((err) => {
        toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
        setPage(1);
      })
      .finally(() => {
        setSelectedItems({
          categories: [],
          subCategories: [],
        });
        setBulkDeleteLoader((prev) => false);
        setBulkDeleteConfirmation({ show: false, payload: {}, value: "" });

      });
  }
  console.log(deleteInfo,"this is delete info")
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
        >
          <CommonButton
            text="Add Category/SubCategory"
            onClick={() => {
              handleCategoryModal({ action: "open" });
            }}
            type="button"
            className="orange_btn"
          />
        </FilterSection>
        <TableWrapper
          columns={CATEGORY_PAGE_COLUMNS}
          onCheckboxChange={(e) => {
            selectAllItems(e, categories);
          }}
          checked={isSelectAllChecked()}
        >
          {categories?.length ? (
            categories?.map((it, idx) => (
              <SingleCategoryRow
                key={idx}
                item={it}
                currentPage={page}
                index={idx}
                handleActions={handleActions}
                selectedItems={selectedItems}
                handleSelectItems={handleSelectItems}
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
        {showModal && (
          <DeleteConfirmationModal
            title={`Are you sure you want to delete this ${itemToDelete?.type === "category" ? "Category" : "Subcategory"
              }?`}
            description={`This action cannot be redo. Deleting this  ${itemToDelete?.type === "category" ? "Category" : "Subcategory"
              } will permanently remove it.`}
            onCancel={() => {
              setItemToDelete({ id: null, type: "" });
              toggleModal();
            }}
            onDelete={handleDeleteCategory}
            loader={deleteLoader}
            deleteText={deleteInfo?.status === "delete" ? "delete" : "move_to_trash"}
          />
        )}

        {deleteInfo?.show && (
          <DeleteConfirmationModal
            title={createDeleteConfirmationTitle(
              `${deleteInfo?.type === "category" ? "category_small" : "sub_category"}`,
              deleteInfo?.status
            )}
            description={createDeleteConfirmationDescription(
              `${deleteInfo?.type === "category" ? "category_small" : "sub_category"}`,
              deleteInfo?.status
            )}
            onCancel={() => {
              setDeleteInfo({
                show: false,
                itemToDelete: null,
                status: "",
                type: "",
              });
            }}
            loader={deleteLoader}
            onDelete={handleDeleteCategory}
            deleteText={deleteInfo?.status === "delete" ? "delete" : "move_to_trash"}
          />
        )}

        {bulkDeleteConfirmation?.show && (
          <DeleteConfirmationModal
            title={BULK_DELETE_TITLE}
            description={BULK_CATEGORY_DELETE_DESCRIPTION}
            onCancel={() => {
              setBulkDeleteConfirmation({ show: false, payload: {}, value: "" });
            }}
            loader={bulkDeleteLoader}
            onDelete={bulkDeleteCategory}
          />
        )}

        {categoryModal?.showModal && (
          <AddEditCategorySection
            onClose={() => handleCategoryModal({ action: "close" })}
            onSubmit={handleAddEditCategory}
            formConfig={formConfig}
            file={file}
            setFile={setFile}
            editCategoryInfo={editCategoryInfo}
            btnLoaders={btnLoaders}
            categories={categories}
          />
        )}
      </>
    </>
  );
};

export default Categories;
