import React, { useEffect, useState } from "react";
import useLoader from "../hooks/useLoader";
import PageLoader from "../loaders/PageLoader";
import FilterSection from "../Components/Common/FilterSection";
import usePagination from "../hooks/usePagination";
import { makeApiRequest, METHODS } from "../api/apiFunctions";
import { SUPPORT_ENDPOINT } from "../api/endpoints";
import TableWrapper from "../Wrappers/TableWrapper";
import NoDataFound from "../Components/Common/NoDataFound";
import SingleSupportRow from "../Components/SingleSupportRow";
import {
  DEFAULT_ERROR_MESSAGE,
  DUMMY_SUPPORT_DATA,
  ITEMS_PER_PAGE,
} from "../constant";
import Pagination from "../Components/Common/Pagination";
import useModalToggle from "../hooks/useModalToggle";
import DeleteConfirmationModal from "../Modals/DeleteConfirmationModal";
import { successType, toastMessage } from "../utils/toastMessage";
import { deleteItemBasedOnId } from "../utils/helpers";
import { T } from "../utils/languageTranslator";
const SUPPORT_COLUMNS = [
  T["id"],
  T["name"],
  T["email"],
  T["issue_description"],
  T["status"],
  T["date_created"],
  T["assigned_to"],
  T["action"],
];
const filterFields = [
  {
    type: "search",
    placeholder: T["search_customers"],
    filterName: "name",
  },
];
const Support = () => {
  const { pageLoader, toggleLoader } = useLoader();
  const { page, onPageChange } = usePagination();
  const [searchInput, setSearchInput] = useState("");
  const { showModal: showDeleteModal, toggleModal: toggleDeleteModal } =
    useModalToggle();
  const [supportData, setSupportData] = useState([]);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [totalData, setTotalData] = useState(null);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [filters, setfilters] = useState({
    name: "",
  });

  useEffect(() => {
    toggleLoader("pageLoader");
    const apiParams = {
      ...filters,
      page: page,
    };
    setSupportData(DUMMY_SUPPORT_DATA);
    makeApiRequest({
      // update required: Update with the actual endpoint
      endPoint: SUPPORT_ENDPOINT,
      params: apiParams,
      method: METHODS.get,
    })
      .then((res) => {
        setSupportData(res?.data?.results);
        setTotalData(res?.data?.count);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        toggleLoader("pageLoader");
      });
  }, [page, filters]);

  const deleteSupport = () => {
    setDeleteLoader((prev) => true);
    //update required : remove this section and uncomment the api call
    // UpDate Requrid: Tostmessage changed name.
    toastMessage("Deleted Successfully", successType);
    setSupportData(deleteItemBasedOnId(supportData, itemToDelete));
    setDeleteLoader((prev) => false);
    toggleDeleteModal();
    // makeApiRequest({
    //   endPoint: SUPPORT_ENDPOINT,
    //   method: METHODS.delete,
    //   delete_id: itemToDelete,
    // })
    //   .then((res) => {
    //     // update required:Add a proper message here
    //     toastMessage("Deleted Successfully", successType);
    //     setSupportData(deleteItemBasedOnId(supportData, itemToDelete));
    //   })
    //   .catch((err) => {
    //     // update required: chek in the api in which object error message is coming
    //     toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
    //   })
    //   .finally(() => {
    // setSupportData(deleteItemBasedOnId(supportData, itemToDelete));
    // setDeleteLoader((prev) => false);
    // toggleDeleteModal();
    //   });
  };
  const handleFilterChange = (filterName, value) => {
    const temp = { ...filters };
    temp[filterName] = value;
    setfilters(temp);
  };
  const handleActions = ({ action, deleteId }) => {
    if (action === "delete") {
      toggleDeleteModal();
      setItemToDelete(deleteId);
    } else {
      //  UpDate Required: For edit
    }
  };
  return (
    <>
      {pageLoader ? (
        <PageLoader />
      ) : (
        <>
          <FilterSection
            filterFields={filterFields}
            handleFilterChange={handleFilterChange}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
          />
          <TableWrapper columns={SUPPORT_COLUMNS}>
            {supportData?.length ? (
              supportData?.map((it, idx) => (
                <SingleSupportRow
                  key={idx}
                  item={it}
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
          {showDeleteModal && (
            <DeleteConfirmationModal
              title={T["remove_this_support"]}
              description={T["this_action_cannot_be_redo"]}
              onCancel={() => {
                setItemToDelete(null);
                toggleDeleteModal();
              }}
              onDelete={deleteSupport}
              loader={deleteLoader}
            />
          )}
        </>
      )}
    </>
  );
};

export default Support;
