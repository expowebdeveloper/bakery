import React, { useEffect, useState } from "react";
import FilterSection from "../Components/Common/FilterSection";
import {
  ACTIONS,
  BULK_DELETE_TITLE,
  BULK_RECIPE_DELETE_DESCRIPTION,
  DEFAULT_ERROR_MESSAGE,
  ITEMS_PER_PAGE,
  RECIPE_SORT_BY,
  SORT_VALUES,
  TYPE_OPTIONS,
  UPDATE_DESCRIPTION_TEXT,
} from "../constant";
import CommonButton from "../Components/Common/CommonButton";
import { useNavigate } from "react-router-dom";
import usePagination from "../hooks/usePagination";
import useLoader from "../hooks/useLoader";
import {
  bulkActionRecipe,
  INSTANCE,
  makeApiRequest,
  METHODS,
} from "../api/apiFunctions";
import { PRINT_RECIPE_ENDPOINT, RECIPE_ENDPOINT } from "../api/endpoints";
import Pagination from "../Components/Common/Pagination";
import TableWrapper from "../Wrappers/TableWrapper";
import NoDataFound from "../Components/Common/NoDataFound";
import useModalToggle from "../hooks/useModalToggle";
import DeleteConfirmationModal from "../Modals/DeleteConfirmationModal";
import SingleRecipeRow from "../Components/SingleRecipeRow";
import { successType, toastMessage } from "../utils/toastMessage";
import {
  actionToText,
  createDeleteConfirmationDescription,
  createDeleteConfirmationTitle,
  createPayloadForRecipe,
  createPreview,
  createRecipePayload,
  downloadPDF,
  filterDeletedItems,
  getSortValue,
  handleBulkMessage,
  handlePrint,
  handlePrintImage,
  removeLeadingDash,
} from "../utils/helpers";
import PageLoader from "../loaders/PageLoader";
import { T } from "../utils/languageTranslator";
import useSelectedItems from "../hooks/useSelectedItems";
import PrintModal from "../Modals/PrintModal";
import ChangeStatusModal from "../Components/Common/ChangeStatusModal";
import ServingUpdateModal from "../Modals/ServingUpdateModal";
import { useForm } from "react-hook-form";
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
    options: RECIPE_SORT_BY,
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
    placeholder: T["search_recipe"],
  },
];
const RECIPE_COLUMNS = [
  "checkbox",
  T["recipe_name"],
  T["created_date"],
  T["categories"],
  T["recipe_prep_time"],
  T["cook_time"],
  T["serving_size"],
  T["status"],
  T["actions"],
];

const Recipe = () => {
  const navigate = useNavigate();
  const formConfig = useForm();
  const { page, onPageChange, setPage } = usePagination();
  const { pageLoader, toggleLoader, setPageLoader } = useLoader();
  const { showModal: showDeleteModal, toggleModal: toggleDeleteModal } =
    useModalToggle();
  const {
    selectedItems: selectedRecipes,
    setSelectedItems: setSelectedRecipes,
    handleSelectItems: handleSelectRecipe,
    selectAllItems: selectAllRecipes,
  } = useSelectedItems();

  const [filters, setFilters] = useState({
    status: "all",
    action: "",
    search: "",
    sort: "asc",
    sort_by: "",
  });
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
  const [bulkDeleteLoader, setBulkDeleteLoader] = useState(false);

  const [recipes, setRecipes] = useState([]);
  const [totalData, setTotalData] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [deleteLoader, setDeleteLoader] = useState(false);
  const [buttonLoader, setButtonLoader] = useState(false);
  const [printLoaders, setPrintLoaders] = useState({
    print: false,
    download: false,
  });
  const [printModalInfo, setPrintModalInfo] = useState({
    item: null,
    show: false,
  });
  const [servingUpdateInfo, setServingUpdateInfo] = useState({
    item: null,
    show: false,
  });
  const [searchInput, setSearchInput] = useState("");
  const [servingId, setServingId] = useState(null);
  // have created this for directly printing recipe from the single row
  const [printLoader, setPrintLoader] = useState(null);
  const [deleteInfo, setDeleteInfo] = useState({
    show: false,
    itemToDelete: null,
    status: "",
  });


  useEffect(() => {
    const apiFilters = {
      ...filters,
      status: "",
      page: page,
    };
    fetchRecipes(apiFilters);
  }, [page, filters]);

  const handleFilterChange = (filterName, value) => {
    if (filterName === "action") {
      if (selectedRecipes?.length) {
        console.log(value, "this is value");
        const payload = {
          recipes: [...selectedRecipes],
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
        bulkActionRecipe(payload)
          .then(() => {
            // setFilters({ ...filters, action: "" })
            toastMessage(
              `Recipes ${actionToText[value]} successfully`,
              successType
            );
          })
          .catch((err) => {
            console.log();
            toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
          })
          .finally(() => {
            setPageLoader((prev) => false);
            setFilters({ ...filters, action: "" });
            setSelectedRecipes([]);
          });
      } else {
        toastMessage(handleBulkMessage("recipe"));
      }
    } else {
      const temp = { ...filters };
      if (value === "all") {
        // temp[filterName] = "";
        temp[filterName] = "all";

      } else {
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
      }
      if (!searchInput) {
        temp["search"] = "";
      }
      setFilters(temp);
      setPage(1);
    }
  };
  const fetchRecipes = (apiFilters) => {
    const apiParams = {
      ...filters,
      page: page,
    };
    setPageLoader((prev) => true);
    makeApiRequest({
      endPoint: RECIPE_ENDPOINT,
      method: METHODS?.get,
      params: apiParams,
      isCustom: true,
    })
      .then((res) => {
        setRecipes(res?.data?.results);
        setTotalData(res?.data?.count);
      })
      .catch((err) => console.log(err))
      .finally(() => setPageLoader((prev) => false));
  };

  const handleActions = ({ action, id, item, index, deleteItem }) => {
    if (action === "delete") {
      const { id, is_deleted } = deleteItem;
      setDeleteInfo({
        show: true,
        itemToDelete: deleteItem,
        status: is_deleted ? "delete" : "trash",
      });
    } else if (action === "edit") {
      navigate(`/add-edit-recipe/`, { state: { recipe_id: id } });
    } else if (action === "printNutritionInfo") {
      console.log(item?.nutrition?.nutrition_image, "this is item");
      const preview = createPreview(item?.nutrition?.nutrition_image);
      handlePrintImage(preview);
      console.log(preview, "this is preview");
    } else {
      const data = { quantity: item?.serving_size, id: item?.id, index: index };
      onRecipeSubmit(data);
      // setPrintModalInfo({
      //   item: item,
      //   show: true,
      // });
    }
  };
  const handlePrintNutrition = (imageUrl) => {
    const printWindow = window.open(imageUrl, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    } else {
      alert("Please allow pop-ups for this site to print.");
    }
  };

  const deleteRecipe = () => {
    const { status, itemToDelete } = deleteInfo;
    const isTrash = status === "trash";

    setDeleteLoader((prev) => true);
    makeApiRequest({
      endPoint: RECIPE_ENDPOINT,
      method: isTrash ? METHODS?.patch : METHODS?.delete,
      delete_id: isTrash ? null : itemToDelete?.id,
      update_id: isTrash ? itemToDelete?.id : null,
      payload: isTrash ? createPayloadForRecipe(itemToDelete) : null,
      instanceType: isTrash ? INSTANCE.formInstance : INSTANCE.authorized,
    })
      .then((res) => {
        toastMessage(isTrash ? "Recipe moved to trashed successfully" : "Recipe deleted successfully", successType);
        // setRecipes(deleteItemBasedOnId(recipes, itemToDelete)); //itemTo delete contains the id
        if (page === 1) {
          fetchRecipes();
        } else {
          setPage(1);
        }
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
        toggleLoader("buttonLoader");
        setDeleteLoader((prev) => false);
      });
  };
  console.log(deleteInfo?.itemToDelete, "this is delete iten");
  const onRecipeSubmit = (data, event) => {
    // const buttonType = event.nativeEvent.submitter.name;
    // handlePrintLoaders(buttonType);
    console.log(data, "data inside recipe submit");
    const payload = {
      serving_size: data?.quantity,
    };
    setPrintLoader(data?.index);
    makeApiRequest({
      endPoint: `${PRINT_RECIPE_ENDPOINT}/${data?.id}/`,
      method: METHODS?.post,
      payload: payload,
    })
      .then((res) => {
        console.log(res?.data, "this is print");
        handlePrint(res?.data);
        // if (buttonType === "download") {
        //   downloadPDF(res?.data);
        // } else {
        //   handlePrint(res?.data);
        // }
      })
      .catch((err) => {
        console.log(err?.response, "insid err");
        toastMessage(err?.response?.data?.detail || DEFAULT_ERROR_MESSAGE);
      })
      .finally(() => {
        // handlePrintLoaders(buttonType);
        setPrintLoader(null);
        setPrintModalInfo({
          show: false,
          item: null,
        });
      });
  };
  const handlePrintLoaders = (buttonType) => {
    setPrintLoaders((prev) => ({
      ...prev,
      [buttonType]: !prev[buttonType],
    }));
  };
  const changeStatus = () => {
    const { status, id } = statusChangeInfo;
    setButtonLoader((prev) => true);
    const payload = {
      status: status,
      recipes: [id],
    };

    bulkActionRecipe(payload)
      .then((res) => {
        toastMessage("Status updated successfully", successType);
        const apiFilters = {
          ...filters,
          page: page,
        };
        fetchRecipes(apiFilters);
      })
      .catch((err) => {
        console.log(err?.response?.data);
        toastMessage(err?.response?.data || DEFAULT_ERROR_MESSAGE);
      })
      .finally(() => {
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
  const handleServingUpdateCancel = () => {
    setServingUpdateInfo({
      show: false,
      item: null,
    });
    setButtonLoader((prev) => false);
  };
  const updateServing = (data) => {
    const { item } = servingUpdateInfo;
    setButtonLoader((prev) => true);
    // const payload = {
    //   ...item,
    //   status: item?.status === "publish" ? "publish" : "draft",
    //   serving_size: +data?.quantity,
    //   category: item?.category
    //     ? Array.isArray(item?.category)
    //       ? returnCategories(item?.category)
    //       : [item?.category?.id]
    //     : null,
    // };
    // const formData = new FormData();
    // for (let key in payload) {
    //   if (
    //     key === "ingredients" ||
    //     key === "instructions" ||
    //     key === "category"
    //   ) {
    //     const striginfiedResult = JSON.stringify(payload[key]);
    //     formData.append(key, striginfiedResult);
    //   } else {
    //     formData.append(key, payload[key]);
    //   }
  // }
    const payload = {
      serving_size: +data?.quantity,
    }
    let formData = new FormData();
    for (let key in payload) {
      formData.append(key, payload[key]);
    }
    makeApiRequest({
      endPoint: RECIPE_ENDPOINT,
      method: METHODS?.patch,
      update_id: item?.id,
      payload: formData,
      instanceType: INSTANCE.formInstance,
    })
      .then((res) => {
        toastMessage("Serving Size Updated Successfully", successType);
        const apiFilters = {
          ...filters,
          page: page,
        };
        fetchRecipes(apiFilters);
      })
      .catch((err) => {
        console.log(err, "this is err");
        toastMessage(err?.response || DEFAULT_ERROR_MESSAGE);
      })
      .finally(() => {
        handleServingUpdateCancel();
        setServingId(null);
        setButtonLoader((prev) => false);
        setPrintModalInfo({
          show: false,
          item: null,
        });
        setServingUpdateInfo({
          show: false,
          item: null,
        });
      });
  };
  const returnCategories = (categories) => {
    return categories?.map((ct) => Number(ct?.id));
  };
  const bulkDeleteRecipe = () => {
    setBulkDeleteLoader((prev) => true);
    const { payload, value } = bulkDeleteConfirmation;
    bulkActionRecipe(payload)
      .then(() => {
        toastMessage(
          `Recipes ${actionToText[value]} successfully`,
          successType
        );
      })
      .catch((err) => {
        console.log();
        toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
      })
      .finally(() => {
        setBulkDeleteLoader((prev) => false);
        setFilters({ ...filters, action: "" });
        setSelectedRecipes([]);
        setBulkDeleteConfirmation({ show: false, payload: {}, value: "" });
      });
  }
  console.log(servingId, "this is serving ID");
  return (
    <div>
      {pageLoader && <PageLoader />}
      <>
        <FilterSection
          filterFields={filterFields}
          handleFilterChange={handleFilterChange}
          filters={filters}
          isRecipe={true}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
        >
          <CommonButton
            text="Categories"
            className="grey_btn"
            onClick={() => navigate("/categories")}
          />
          <CommonButton
            text="Add New Recipe"
            className="orange_btn"
            onClick={() => navigate("/add-edit-recipe")}
          />
        </FilterSection>
        <TableWrapper
          columns={RECIPE_COLUMNS}
          onCheckboxChange={(e) => {
            selectAllRecipes(e, recipes);
          }}
          checked={
            recipes?.length && recipes?.length === selectedRecipes?.length
          }
        >
          {recipes?.length ? (
            // filterDeletedItems(recipes)?.map((it, idx) => (
            recipes?.map((it, idx) => (
              <SingleRecipeRow
                key={idx}
                item={it}
                index={idx}
                currentPage={page}
                handleActions={handleActions}
                printLoader={printLoader}
                isRecipe={true}
                selectedRecipes={selectedRecipes}
                handleSelectRecipe={handleSelectRecipe}
                // handleRecipeStatusChange={handleRecipeStatusChange}
                handleRecipeStatusChange={(item, status) => {
                  setStatusChangeInfo({
                    show: true,
                    id: item?.id,
                    status: status,
                  });
                }}
                handleServingEdit={(item) => {
                  setServingUpdateInfo({
                    show: false,
                    item: item,
                  });
                  setServingId(item);
                  setPrintModalInfo({
                    show: true,
                    item: item,
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
          itemsPerPage={ITEMS_PER_PAGE}
          totalData={totalData}
          currentPage={page}
        />
        {deleteInfo?.show && (
          <DeleteConfirmationModal
            title={createDeleteConfirmationTitle(
              "recipe",
              deleteInfo?.status
            )}
            description={createDeleteConfirmationDescription(
              "recipe",
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
            onDelete={deleteRecipe}
            loader={deleteLoader}
          />
        )}
        {printModalInfo?.show && (
          <PrintModal
            onCancel={() => {
              setPrintModalInfo({
                show: false,
                item: null,
              });
            }}
            printModalInfo={printModalInfo}
            onRecipeSubmit={updateServing}
            printLoaders={printLoaders}
            buttonLoader={buttonLoader}
          />
        )}
        {statusChangeInfo?.show && (
          <ChangeStatusModal
            description={
              "This action will update the status of the Recipe"
            }
            onStatusChange={changeStatus}
            loader={buttonLoader}
            onCancel={handleStatusCancel}
          >
            <p>
              Are you sure you want to update status to{" "}
              <span className="capitalize">{statusChangeInfo?.status}</span>
            </p>
          </ChangeStatusModal>
        )}
        {bulkDeleteConfirmation?.show && (
          <DeleteConfirmationModal
            title={BULK_DELETE_TITLE}
            description={BULK_RECIPE_DELETE_DESCRIPTION}
            onCancel={() => {
              setBulkDeleteConfirmation({ show: false, payload: {}, value: "" });
            }}
            loader={bulkDeleteLoader}
            onDelete={bulkDeleteRecipe}
          />
        )}
        {/* {servingUpdateInfo?.show && (
          <ServingUpdateModal
            loader={buttonLoader}
            onCancel={handleServingUpdateCancel}
            formConfig={formConfig}
            item={servingUpdateInfo?.item}
            onServingUpdate={updateServing}
          />
        )} */}
      </>
    </div>
  );
};

export default Recipe;
