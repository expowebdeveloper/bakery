import React, { useEffect, useState } from "react";
import usePagination from "../hooks/usePagination";
import { useForm } from "react-hook-form";
import FilterSection from "../Components/Common/FilterSection";
import useLoader from "../hooks/useLoader";
import { makeApiRequest, METHODS } from "../api/apiFunctions";
import {
  EMPLOYEE_ENDPOINT,
  EMPLOYEE_MANAGEMENT_ENDPOINT,
} from "../api/endpoints";
import CommonButton from "../Components/Common/CommonButton";
import {
  DEFAULT_ERROR_MESSAGE,
  EMPLOYEE_ID_ERROR,
  EMPLOYEE_SORT_BY,
  ITEMS_PER_PAGE,
} from "../constant";
import useModalToggle from "../hooks/useModalToggle";
import TableWrapper from "../Wrappers/TableWrapper";
import SingleEmployeeRow from "../Components/SingleEmployeeRow";
import NoDataFound from "../Components/Common/NoDataFound";
import DeleteConfirmationModal from "../Modals/DeleteConfirmationModal";
import { successType, toastMessage } from "../utils/toastMessage";
import AddEditEmployee from "../Components/AddEditEmployee";
import {
  formatPostalCode,
  getState,
  handleEdit,
  returnAddressInfo,
} from "../utils/helpers";
import Pagination from "../Components/Common/Pagination";
import PageLoader from "../loaders/PageLoader";
import { T } from "../utils/languageTranslator";
import ChangeStatusModal from "../Components/Common/ChangeStatusModal";
const filterFields = [
  {
    type: "select",
    defaultOption: T["sort_by"],
    options: EMPLOYEE_SORT_BY,
    filterName: "sort_by",
  },
  {
    type: "search",
    filterName: "search",
    placeholder: T["search_employee"],
  },
];
const EMPLOYEE_COLUMNS = [
  // T["id"],
  T["s_no"],
  T["name"],
  T["employee_id"],
  T["role"],
  T["email"],
  T["phone_number"],
  T["shift"],
  T["added_on"],
  T["joining_date"],
  T["status"],
  T["action"],
];

const EmployeeManagement = () => {
  const { page, onPageChange, setPage } = usePagination();
  const { pageLoader, toggleLoader } = useLoader();
  const formConfig = useForm();
  const { reset, watch } = formConfig;
  const { showModal: showEmployeeSection, toggleModal: toggleEmployeeSection } =
    useModalToggle();
  const { showModal: showDeleteModal, toggleModal: toggleDeleteModal } =
    useModalToggle();
  const [employees, setEmployees] = useState([]);
  const [editInfo, setEditInfo] = useState({
    isEdit: false,
    editItem: null,
  });
  const [totalData, setTotalData] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [filters, setFilters] = useState({
    sort_by: "",
    search: "",
  });
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [buttonLoader, setButtonLoader] = useState(false);
  const [IdGenerateLoader, setIdGenerateLoader] = useState(false);
  const [statusChangeInfo, setStatusChangeInfo] = useState({
    show: false,
    item: null,
    status: "",
  });
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchEmployee();
  }, [page, filters]);

  const fetchEmployee = (isAdd) => {
    toggleLoader("pageLoader");
    const apiParams = {
      ...filters,
      page: isAdd ? 1 : page,
    };
    makeApiRequest({
      endPoint: EMPLOYEE_MANAGEMENT_ENDPOINT,
      params: apiParams,
      method: METHODS.get,
    })
      .then((res) => {
        setEmployees(res?.data?.results);
        setTotalData(res?.data?.count);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        toggleLoader("pageLoader");
      });
  };
  const handleFilterChange = (filterName, value) => {
    const temp = { ...filters };
    temp[filterName] = value;
    setFilters(temp);
    setPage(1);
  };

  const handleActions = ({ action, deleteId, editItem }) => {
    if (action === "edit") {
      setEditInfo({
        isEdit: true,
        editItem: editItem,
      });
      toggleEmployeeSection();
    } else {
      setItemToDelete(deleteId);
      toggleDeleteModal();
    }
  };

  const handleEmployeeSection = ({ action }) => {
    if (action === "open") {
      toggleEmployeeSection();
    } else {
      toggleEmployeeSection();
      setEditInfo({
        isEdit: false,
        editItem: null,
      });
      setButtonLoader((prev) => false);
      reset();
    }
  };
  const deleteEmployee = () => {
    setDeleteLoader((prev) => true);
    makeApiRequest({
      endPoint: EMPLOYEE_ENDPOINT,
      method: METHODS.delete,
      delete_id: itemToDelete,
    })
      .then((res) => {
        // setEmployees(deleteItemBasedOnId(employees, itemToDelete));
        if (page === 1) {
          fetchEmployee();
        } else {
          setPage(1);
        }
        toastMessage("Employee Deleted Successfully", successType);
      })
      .catch((err) => {
        toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
      })
      .finally(() => {
        setDeleteLoader((prev) => false);
        toggleDeleteModal();
        setItemToDelete(null);
      });
  };

  const handleEmployeeCancel = () => {
    toggleEmployeeSection();
    setEditInfo({ isEdit: false, item: null });
    reset(); // for resetting form values
  };
  const onSubmit = (values) => {
    const { editItem, isEdit } = editInfo;
    const addressInfo = {
      city: "",
      state: "",
      zip: "",
    };
    if (isEdit && !values?.address?.address_components) {
      addressInfo.state = editItem?.employee_detail?.state;
      addressInfo.city = editItem?.employee_detail?.city;
      addressInfo.zip = editItem?.employee_detail?.zip_code;
    } else {
      const { state, city, zip } = returnAddressInfo(
        values?.address?.address_components
      );
      addressInfo.state = state;
      addressInfo.city = city;
      addressInfo.zip = zip && formatPostalCode(zip);
    }
    setButtonLoader((prev) => true);
    const payload = {
      email: values.email,
      role: values.role,
      first_name: values.first_name,
      last_name: values.last_name,
      employee_detail: {
        employee_id: values.employee_id,
        address: values.address?.formatted_address || values.address,
        city: addressInfo?.city,
        state: getState(addressInfo.state),
        country: "SE",
        zip_code: values.zip_code,
        contact_no: values.contact_no,
        hiring_date: values?.hiring_date,
        shift: values.shift,
        job_type: values?.job_type?.value,
      },
    };
    makeApiRequest({
      endPoint: EMPLOYEE_MANAGEMENT_ENDPOINT,
      payload: payload,
      method: editInfo?.isEdit ? METHODS?.patch : METHODS.post,
      update_id: editInfo?.isEdit && editInfo?.editItem?.id,
    })
      .then((res) => {
        toastMessage(
          `Employee ${editInfo?.isEdit ? "updated" : "added"} successfully`,
          successType
        );
        if (editInfo?.isEdit) {
          setEmployees(
            handleEdit(employees, editInfo?.editItem?.id, res?.data?.user)
          );
        } else {
          // setEmployees((prev) => [...prev, res?.data?.user]);
          fetchEmployee(true);
        }
        handleEmployeeCancel();
      })
      .catch((err) => {
        console.log(err, "this is error");
        const fieldError =
          err?.response?.data?.message?.name?.[0] ||
          err?.response?.data?.message?.employee_detail?.contact_no?.[0]||
          err?.response?.data?.message?.email?.[0] ||
          (err?.response?.data?.error === EMPLOYEE_ID_ERROR &&
            err?.response?.data?.error);

        toastMessage(fieldError || DEFAULT_ERROR_MESSAGE);
        if (!fieldError) {
          handleEmployeeCancel();
          setPage(1);
        }
      })
      .finally(() => setButtonLoader((prev) => false));
  };
  const changeStatus = () => {
    const { item, status } = statusChangeInfo;
    const { employee_detail } = item;
    console.log(item, "this is item");
    setButtonLoader((prev) => true);
    const payload = {
      email: item?.email,
      role: item?.role,
      first_name: item?.first_name,
      last_name: item?.last_name,
      employee_detail: {
        employee_id: employee_detail?.employee_id,
        address: employee_detail?.address,
        city: employee_detail?.city,
        state: employee_detail?.state,
        country: employee_detail?.country,
        zip_code: employee_detail?.zip_code,
        contact_no: employee_detail?.contact_no,
        hiring_date: employee_detail?.hiring_date,
        shift: employee_detail?.shift,
        status: status,
      },
    };

    makeApiRequest({
      endPoint: EMPLOYEE_MANAGEMENT_ENDPOINT,
      payload: payload,
      method: METHODS?.patch,
      update_id: item?.id,
    })
      .then((res) => {
        toastMessage("Status updated successfully", successType);
        if (page === 1) {
          fetchEmployee();
        } else {
          setPage(1);
        }
      })
      .catch((err) => {
        toastMessage(err?.response?.data || DEFAULT_ERROR_MESSAGE);
      })
      .finally(() => {
        setButtonLoader((prev) => false);
        handleStatusCancel();
      });
  };
  const handleStatusCancel = () => {
    setStatusChangeInfo({
      show: false,
      item: null,
      id: "",
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
            text="Add New Employee"
            className="orange_btn"
            type="button"
            onClick={() => {
              handleEmployeeSection({ action: "open" });
            }}
          />
        </FilterSection>
        <TableWrapper columns={EMPLOYEE_COLUMNS}>
          {employees?.length ? (
            employees?.map((it, idx) => (
              <SingleEmployeeRow
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
          itemsPerPage={ITEMS_PER_PAGE}
          totalData={totalData}
          currentPage={page}
        />
        {showDeleteModal && (
          <DeleteConfirmationModal
            title="Are you sure you want to remove this employee?"
            description="This action cannot be redo."
            onCancel={() => {
              setItemToDelete(null);
              toggleDeleteModal();
            }}
            onDelete={deleteEmployee}
            loader={deleteLoader}
          />
        )}
        {showEmployeeSection && (
          <AddEditEmployee
            onClose={() => {
              handleEmployeeSection({ action: "close" });
            }}
            formConfig={formConfig}
            onSubmit={onSubmit}
            loader={buttonLoader}
            editInfo={editInfo}
            IdGenerateLoader={IdGenerateLoader}
          />
        )}
        {statusChangeInfo?.show && (
          <ChangeStatusModal
            description={`This action will update the status of the Employee `}
            onStatusChange={changeStatus}
            loader={buttonLoader}
            onCancel={handleStatusCancel}
            formConfig={formConfig}
          >
            <p>
              Are you sure you want to update status to{" "}
              <span className="capitalize">
                {statusChangeInfo?.status === "on_leave"
                  ? "On Leave"
                  : statusChangeInfo?.status}
              </span>
            </p>
          </ChangeStatusModal>
        )}
      </>
    </div>
  );
};

export default EmployeeManagement;
