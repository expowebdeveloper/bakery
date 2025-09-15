import React, { useEffect, useState } from "react";
import FilterSection from "../Components/Common/FilterSection";
import {
  CUSTOMER_SORT_BY,
  CUSTOMER_TYPES,
  DEFAULT_ERROR_MESSAGE,
  ITEMS_PER_PAGE,
} from "../constant";
import { makeApiRequest, METHODS } from "../api/apiFunctions";
import { CUSTOMER_ENDPOINT, ADD_CUSTOMER_ENDPOINT, GENERATE_SIGNUP_LINK_ENDPOINT } from "../api/endpoints";
import useLoader from "../hooks/useLoader";
import usePagination from "../hooks/usePagination";
import TableWrapper from "../Wrappers/TableWrapper";
import SingleCustomerRow from "../Components/SingleCustomerRow";
import NoDataFound from "../Components/Common/NoDataFound";
import useModalToggle from "../hooks/useModalToggle";
import DeleteConfirmationModal from "../Modals/DeleteConfirmationModal";
import PageLoader from "../loaders/PageLoader";
import Pagination from "../Components/Common/Pagination";
import { successType, toastMessage } from "../utils/toastMessage";
import { T } from "../utils/languageTranslator";
import { createCustomerPayload, createDeleteConfirmationDescription, createDeleteConfirmationTitle, createName, handleViewPdf } from "../utils/helpers";
import { useLocation } from "react-router-dom";
import ViewCustomer from "../Components/ViewCustomer";
import { useForm } from "react-hook-form";
import CommonButton from "../Components/Common/CommonButton";
import CustomerSection from "../Components/CustomerSection";
import SignupLinkSection from "../Modals/SingUpLinkSection";
const filterFields = [
  {
    type: "select",
    defaultOption: T["select_type"],
    options: CUSTOMER_TYPES,
    filterName: "status",
  },
  {
    type: "select",
    filterName: "sort_by",
    defaultOption: T["sort_by"],
    options: CUSTOMER_SORT_BY,
  },
  {
    type: "search",
    filterName: "search",
    placeholder: T["search_customers"],
  },
];
const CUSTOMER_COLUMNS = [
  // T["id"],
  T["s_no"],
  T["customer_id"],
  T["name"],
  T["created_at"],
  T["contact_person"],
  T["contact_details"],
  T["address"],
  T["order_history"],
  T["action"],
];
const Customers = () => {
  const location = useLocation();
  const { pageLoader, setPageLoader } = useLoader();
  const { page, onPageChange, setPage } = usePagination();
  const { showModal: showDeleteModal, toggleModal: toggleDeleteModal } =
    useModalToggle();
  const [customers, setCustomers] = useState([]);
  const [totalData, setTotalData] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [viewSectionInfo, setViewSectionInfo] = useState({
    show: false,
    item: null,
  });
  const formConfig = useForm();
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [deleteInfo, setDeleteInfo] = useState({
    show: false,
    itemToDelete: null,
    status: "",
  });
  const [customerSectionInfo, setCustomerSectionInfo] = useState({
    show: false,
    isEdit: false,
    item: null,
  });
  const [signupLinkInfo, setSignupLinkInfo] = useState({
    show: false,
    link: ""
  })
  const [filters, setFilters] = useState({
    sort_by: "",
    name: "",
    status: "all"
  });
  const [btnLoaders, setBtnLoaders] = useState({
    addCustomer: false,
    generateLink: false,
  });


  useEffect(() => {
    fetchConfigurations();
  }, [page, filters]);

  const fetchConfigurations = () => {
    setPageLoader((prev) => true);
    let apiParams = {}
    if (location?.state?.email) {
      apiParams = {
        ...filters,
        page: page,
        search: location?.state?.email
      };
    } else {
      apiParams = {
        ...filters,
        page: page,
      };

    }
    // setCustomers(DUMMY_CUSTOMER_DATA);
    makeApiRequest({
      // update required: Update with the actual endpoint
      endPoint: CUSTOMER_ENDPOINT,
      params: apiParams,
      method: METHODS.get,
    })
      .then((res) => {
        setCustomers(res?.data?.results);
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
  const handleActions = ({ action, delete_id, deleteItem, viewItem }) => {
    if (action === "delete") {
      const { id } = deleteItem;
      const isTrash = deleteItem?.user?.is_active
      setDeleteInfo({
        show: true,
        itemToDelete: deleteItem,
        status: isTrash ? "trash" : "delete",
      });

      // toggleDeleteModal();
      // setItemToDelete(delete_id);
    } else if (action === "view") {
      setViewSectionInfo({
        show: true,
        item: viewItem,
      });
    }
  };
  const deleteCustomer = () => {
    setDeleteLoader((prev) => true);
    const { status, itemToDelete } = deleteInfo;
    const isTrash = itemToDelete?.user?.is_active;


    //update required : remove this section and uncomment the api call
    makeApiRequest({
      endPoint: "/customer/",
      method: isTrash ? METHODS?.patch : METHODS.delete,
      delete_id: isTrash ? null : itemToDelete?.id,
      payload: isTrash ? createCustomerPayload(itemToDelete) : null,
      update_id: isTrash ? itemToDelete?.id : null,
    })
      .then((res) => {
        toastMessage(`Customer ${isTrash ? "Moved to trash" : "Deleted"} Successfully`, successType);
        // setCustomers(deleteItemBasedOnId(customers, itemToDelete));
        if (page === 1) {
          fetchConfigurations();
        } else {
          setPage(1);
        }
      })
      .catch((err) => {
        // update required: chek in the api in which object error message is coming
        toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
      })
      .finally(() => {
        setDeleteLoader((prev) => false);
        // toggleDeleteModal();
        // setItemToDelete(null);
        setDeleteInfo({
          show: false,
          itemToDelete: null,
          status: "",
        });
      });
  };
  const onSubmit = (data, event) => {
    const buttonType = event.nativeEvent.submitter.name;
    setBtnLoaders((prev) => ({ ...prev, [buttonType]: true }));
    console.log(data);
    if (buttonType === "addCustomer") {
      const payload = {
        company_name: data?.company_name,
        name: createName(data?.first_name, data?.last_name),
        organization_no: data?.organization_no,
        vat_id: data?.vat_id,
        contact_no: data?.contact_no,
        user: {
          first_name: data?.first_name,
          last_name: data?.last_name,
          email: data?.email,
          role: "bakery",
          password: ""
        }
      }
      makeApiRequest({
        endPoint: ADD_CUSTOMER_ENDPOINT,
        method: METHODS.post,
        payload: payload,
      }).then((res) => {
        toastMessage(T["customer_created_successfully"], successType);
        setCustomerSectionInfo({ show: false, isEdit: false, item: null });
        formConfig.reset();
        fetchConfigurations();

      }).catch((err) => {
        console.log(err?.response?.data, "phone error")
        const errorInfo = err?.response?.data?.detail || err?.response?.data?.user?.email?.[0] || err?.response?.data?.contact_no?.[0] || err?.response?.data?.vat_id?.[0] ||err?.response?.data?.organization_no?.[0] || DEFAULT_ERROR_MESSAGE
        toastMessage(errorInfo)
      }).finally(() => {
        setBtnLoaders((prev) => ({ ...prev, [buttonType]: false }));
      })
    } else {
      makeApiRequest({
        endPoint: GENERATE_SIGNUP_LINK_ENDPOINT,
        method: METHODS.post,
        payload: {
        }
      }).then((res) => {
        console.log(res?.data, "this is res")
        setCustomerSectionInfo({ show: false, isEdit: false, item: null });
        setSignupLinkInfo({ show: true, link: res?.data?.registration_link });
        formConfig.reset();
      }).catch((err) => {
        console.log(err?.response?.data, "this is error")
        const errorInfo = err?.response?.data?.detail || err?.response?.data?.error || DEFAULT_ERROR_MESSAGE
        toastMessage(errorInfo)
      }).finally(() => {
        setBtnLoaders((prev) => ({ ...prev, [buttonType]: false }));
      })
    }
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
        >
          <CommonButton
            text={T["add_customer"]}
            className="orange_btn"
            type="button"
            onClick={() => {
              setCustomerSectionInfo({ show: true, isEdit: false, item: null });
            }}
          />
        </FilterSection>
        <TableWrapper columns={CUSTOMER_COLUMNS}>
          {customers?.length ? (
            customers?.map((it, idx) => (
              <SingleCustomerRow
                key={idx}
                item={it}
                index={idx}
                currentPage={page}
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
        {deleteInfo?.show && (
          <DeleteConfirmationModal
            title={createDeleteConfirmationTitle(
              "customer",
              deleteInfo?.status
            )}
            description={createDeleteConfirmationDescription(
              "customer",
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
            onDelete={deleteCustomer}
          />
        )}
        {
          viewSectionInfo?.show && (
            <ViewCustomer
              item={viewSectionInfo?.item}
              onClose={() => {
                setViewSectionInfo({ show: false, item: null });
                formConfig.reset()
              }}
              formConfig={formConfig}
            />
          )
        }
        {
          customerSectionInfo?.show && (
            <CustomerSection
              customerSectionInfo={customerSectionInfo}
              onClose={() => {
                setCustomerSectionInfo({ show: false, item: null })
                formConfig.reset()
              }}
              formConfig={formConfig}
              onSubmit={onSubmit}
              btnLoaders={btnLoaders}
            />
          )
        }
        {
          signupLinkInfo?.show && (
            <SignupLinkSection
              signupLink={signupLinkInfo?.link}
              onCancel={() => {
                setSignupLinkInfo({ show: false, link: "" })
              }}
            />
          )
        }
      </>
    </>
  );
};

export default Customers;
