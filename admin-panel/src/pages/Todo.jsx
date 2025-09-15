import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { makeApiRequest, METHODS } from "../api/apiFunctions";
import {
  ADMIN_TODO_ENDPOINT,
  EMPLOYEE_ENDPOINT,
  TODO_ENDPOINT,
} from "../api/endpoints";

import useLoader from "../hooks/useLoader";
import FilterSection from "../Components/Common/FilterSection";
import CommonButton from "../Components/Common/CommonButton";
import {
  DEFAULT_ERROR_MESSAGE,
  TODO_ITEMS_PER_PAGE,
  TODO_SORT_BY,
} from "../constant";
import usePagination from "../hooks/usePagination";
import TableWrapper from "../Wrappers/TableWrapper";
import NoDataFound from "../Components/Common/NoDataFound";
import SingleTodoRow from "../Components/Common/SingleTodoRow";
import useModalToggle from "../hooks/useModalToggle";
import Pagination from "../Components/Common/Pagination";
import DeleteConfirmationModal from "../Modals/DeleteConfirmationModal";
import { successType, toastMessage } from "../utils/toastMessage";
import {
  deleteItemBasedOnId,
  employeeListIntoOptions,
  handleEdit,
} from "../utils/helpers";
import AddEditTodo from "../Components/AddEditTodo";
import PageLoader from "../loaders/PageLoader";
import { T } from "../utils/languageTranslator";
import ChangeStatusModal from "../Components/Common/ChangeStatusModal";
import RoleWarningModal from "../Modals/RoleWarningModal";
const filterFields = [
  {
    type: "select",
    defaultOption: T["sort_by"],
    options: TODO_SORT_BY,
    filterName: "sort_by",
  },
  {
    type: "search",
    filterName: "search",
    placeholder: T["search_to_do"],
  },
];
export const TODO_COLUMNS = [
  // T["id"],
  T["s_no"],
  T["task_name"],
  T["description"],
  T["assigned_to"],
  T["priority"],
  T["due_date"],
  T["status"],
  T["added_on"],
  T["added_by"],
  T["notes"],
  T["action"],
];
const Todo = () => {
  const { page, onPageChange, setPage } = usePagination();
  const [assignLoader, setAssignLoader] = useState(false);
  const { pageLoader, toggleLoader } = useLoader();
  const todoSection = useModalToggle();
  const deleteModal = useModalToggle();
  const formConfig = useForm();

  const { reset, watch } = formConfig;
  const [todos, setTodos] = useState([]);
  const [filters, setFilters] = useState({
    sort_by: "",
    search: "",
  });
  const [totalData, setTotalData] = useState(null);
  const [showRoleWarningModal, setShowRoleWarningModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editInfo, setEditInfo] = useState({
    isEdit: false,
    editItem: null,
  });
  const [employeeList, setEmployeeList] = useState([]);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [btnLoaders, setBtnLoaders] = useState({
    unassigned: false,
    assigned: false,
  });
  const [statusChangeInfo, setStatusChangeInfo] = useState({
    show: false,
    item: null,
    status: "",
  });
  const [searchInput, setSearchInput] = useState("");
  const [buttonLoader, setButtonLoader] = useState(false);
  // flow 1
  const [assignOnly, setAssignOnly] = useState(false);

  useEffect(() => {
    fetchTodo();
  }, [filters, page]);

  // for setting employee list
  useEffect(() => {
    makeApiRequest({
      endPoint: EMPLOYEE_ENDPOINT,
      method: METHODS.get,
    })
      .then((res) => {
        const options = employeeListIntoOptions(res?.data?.results);
        setEmployeeList(options);
        // const prefillKeys = [
        //   "task_id",
        //   "title",
        //   "description",
        //   "assigned_to",
        //   "notes",
        //   "priority",
        //   "start_date",
        //   "end_date",
        // ];

        // if (isEdit) {
        //   // for filling normal keys
        //   prefillFormValues(editItem, prefillKeys, setValue);
        //   // for prefilling values with custom logic
        //   setValue(
        //     "priority",
        //     extractOption(PRIORITY_OPTIONS, editItem?.priority, "value")
        //   );
        //   const employeeOption = extractOption(
        //     options,
        //     editItem?.assigned_to,
        //     "value"
        //   );
        //   setValue("assigned_to", employeeOption);
        //   console.log(employeeOption, "log employeeOption");
        // }
      })
      .catch((err) => console.log(err));
  }, []);
  const fetchTodo = () => {
    const role = localStorage?.getItem("role");
    toggleLoader("pageLoader");
    const apiFilters = {
      ...filters,
      page: page,
    };
    makeApiRequest({
      endPoint: role === "admin" ? ADMIN_TODO_ENDPOINT : TODO_ENDPOINT,
      params: apiFilters,
      method: METHODS.get,
    })
      .then((res) => {
        setTotalData(res?.data?.count);
        setTodos(res?.data?.results);
      })
      .catch((err) => {
        console.log(err);
      })
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

  // for handling edit and delete buttons inside single row
  // const handleActions = ({ action, id, editItem }) => {
  //   if (action === "edit") {
  //     handleTodoSection({ action: "edit", editItem: editItem });
  //   } else if (action === "delete") {
  //     deleteModal?.toggleModal();
  //     setItemToDelete(id);
  //   }
  // };

  // commented for future use
  const handleActions = ({ action, id, editItem }) => {
    const userId = localStorage.getItem("user_id");
    if (action === "edit") {
      if (editItem?.owner?.id == userId) {
        handleTodoSection({ action: "edit", editItem: editItem });
      } else {
        setShowRoleWarningModal(true);
      }
    } else if (action === "delete") {
      if (editItem?.owner?.id == userId) {
        deleteModal?.toggleModal();
        setItemToDelete(id);
      } else {
        setShowRoleWarningModal(true);
      }
    }
  };
  const deleteTask = () => {
    setDeleteLoader((prev) => true);
    makeApiRequest({
      endPoint: TODO_ENDPOINT,
      method: METHODS?.delete,
      delete_id: itemToDelete,
    })
      .then((res) => {
        toastMessage("Task deleted successfully", successType);
        // setTodos(deleteItemBasedOnId(todos, itemToDelete)); //itemTo delete contains the id
        if (page === 1) {
          fetchTodo();
        } else {
          setPage(1);
        }
      })
      .catch((err) => {
        toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
      })
      .finally((res) => {
        deleteModal?.toggleModal();
        setDeleteLoader((prev) => false);
      });
  };

  const handleTodoSection = ({ action, editItem }) => {
    if (action === "open") {
      todoSection?.toggleModal();
    } else if (action === "close") {
      todoSection?.toggleModal();
      setEditInfo({
        isEdit: false,
        editItem: null,
      });
      reset();
    } else if (action === "edit") {
      todoSection?.toggleModal();
      setEditInfo({
        isEdit: true,
        editItem: editItem,
      });
    }
  };

  // for creating and updating todo

  const onSubmit = (data, event) => {
    const { isEdit, editItem } = editInfo;
    const buttonType = event.nativeEvent.submitter.name;
    const payload = {
      ...data,
      priority: data?.priority?.value,
      status: buttonType,
      assigned_to: data?.assigned_to?.value,
    };
    setBtnLoaders({ ...btnLoaders, [buttonType]: !btnLoaders[buttonType] });
    makeApiRequest({
      endPoint: TODO_ENDPOINT,
      method: isEdit ? METHODS.patch : METHODS.post,
      payload: payload,
      update_id: isEdit ? editItem?.id : null,
    })
      .then((res) => {
        if (isEdit) {
          // setTodos(handleEdit(todos, editItem?.id, res?.data));
          fetchTodo();
        } else {
          // setTodos((prev) => [...prev, res?.data]);
          setPage(1);
          fetchTodo();
        }
        toastMessage(
          isEdit ? "Task Updated successfully" : "Task Created Successfully",
          successType
        );
        handleTodoSection({ action: "close" });
        setBtnLoaders({ unassigned: false, assigned: false });
      })
      .catch((err) => {
        toastMessage(
          err?.response?.data?.task_id?.[0] || DEFAULT_ERROR_MESSAGE
        );
        if (!err?.response?.data?.task_id?.[0]) {
          handleTodoSection({ action: "close" });
          setPage(1);
        }
        setBtnLoaders({ unassigned: false, assigned: false });
      });
  };

  const handleAssignTask = (editItem) => {
    setAssignLoader((prev) => true);
    // flow 1 (Assigne is not required so click of it complete screen will be shown ,task will be assigned and then assign the task)
    // setAssignOnly(true)
    // handleActions({ action: "edit", editItem: editItem });

    // flow 2 (Assigne is required field hence only need to call the API on assign task)
    const payload = {
      ...editItem,
      assigned_to: editItem?.assigned_to?.id,
      status: "assigned",
    };
    makeApiRequest({
      endPoint: TODO_ENDPOINT,
      method: METHODS.patch,
      payload: payload,
      update_id: editItem?.id,
    })
      .then((res) => {
        console.log(res, "this is response");
        // need updated data inside response
        // setTodos(handleEdit(todos, editItem?.id, res?.data)); //array , id to update , data to update
        fetchTodo();
        toastMessage("Task Assigned Successfully", successType);
      })
      .catch((err) => {
        toastMessage(err?.response?.data?.task_id[0] || DEFAULT_ERROR_MESSAGE);
      })
      .finally(() => {
        setAssignLoader((prev) => false);
        setPage(1);
      });
  };
  const changeStatus = () => {
    const { item, status } = statusChangeInfo;
    setButtonLoader((prev) => true);
    const payload = {
      title: item?.title,
      task_id: item?.task_id,
      status: status,
      start_date: item?.start_date,
      priority: item?.priority,
      notes: item?.notes,
      end_date: item?.end_date,
      description: item?.description,
      assigned_to: +item?.assigned_to?.id,
    };
    makeApiRequest({
      endPoint: TODO_ENDPOINT,
      method: METHODS.patch,
      payload: payload,
      update_id: item?.id,
    })
      .then((res) => {
        toastMessage("Status updated successfully", successType);
        fetchTodo();
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
          filters={filters}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
        >
          <CommonButton
            text="Add Todo List"
            className="orange_btn"
            onClick={() => {
              // for opening add edit todo section
              handleTodoSection({ action: "open" });
            }}
          />
        </FilterSection>

        <TableWrapper columns={TODO_COLUMNS}>
          {todos?.length ? (
            todos?.map((it, idx) => (
              <SingleTodoRow
                key={idx}
                item={it}
                handleActions={handleActions}
                employeeList={employeeList}
                handleAssignTask={handleAssignTask}
                assignLoader={assignLoader}
                currentPage={page}
                index={idx}
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
          itemsPerPage={TODO_ITEMS_PER_PAGE}
          totalData={totalData}
          currentPage={page}
        />

        {/* delete confirmation modal */}
        {deleteModal?.showModal && (
          <DeleteConfirmationModal
            title="Are you sure you want to delete this task?"
            description="This action cannot be redo.The task will permanently be deleted"
            onCancel={() => {
              setItemToDelete(null);
              deleteModal.toggleModal();
            }}
            onDelete={deleteTask}
            loader={deleteLoader}
          />
        )}

        {/* add/edit todo section */}
        {todoSection?.showModal && (
          <AddEditTodo
            onClose={() => handleTodoSection({ action: "close" })}
            editInfo={editInfo}
            onSubmit={onSubmit}
            formConfig={formConfig}
            employeeList={employeeList}
            btnLoaders={btnLoaders}
            handleTodoSection={handleTodoSection}
            assignOnly={assignOnly}
          />
        )}
        {statusChangeInfo?.show && (
          <ChangeStatusModal
            description={T["this_action_will_update_the_status_of_the_todo"]}
            onStatusChange={changeStatus}
            loader={buttonLoader}
            onCancel={handleStatusCancel}
            formConfig={formConfig}
          >
            <p>
              Are you sure you want to update status to{" "}
              <span className="capitalize">
                {statusChangeInfo?.status === "in_progress"
                  ? T["in_progress"]
                  : statusChangeInfo?.status === "not_started"
                    ? T["not_started"]
                    : statusChangeInfo?.status}
              </span>
            </p>
          </ChangeStatusModal>
        )}
        {showRoleWarningModal && (
          <RoleWarningModal onOk={() => setShowRoleWarningModal(false)} />
        )}
      </>
    </div>
  );
};

export default Todo;
