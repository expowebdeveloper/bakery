import React from "react";
import ReactPaginate from "react-paginate";
import { login } from "../../api/apiFunctions";
const Pagination = ({ onPageChange, totalData, itemsPerPage, currentPage }) => {
  // if API returns total data then calculate page count by the following way otherwise page count (total Pages will be provided in the APi itself)
  const totalPages = Math.ceil(totalData / itemsPerPage);
  const shouldShowPagination = totalData > itemsPerPage;
  return (
    <>
      {shouldShowPagination && (
        <ReactPaginate
          previousLabel={"<"}
          nextLabel={">"}
          pageCount={totalPages}
          onPageChange={onPageChange}
          containerClassName={"flex gap-4 items-center"}
          previousLinkClassName={"border px-2 bg-[#F5F5F5] rounded-md py-1"}
          nextLinkClassName={"border px-2 bg-[#F5F5F5] rounded-md py-1"}
          disabledClassName={"pagination__link--disabled"}
          activeClassName={"bg-[#FF6363] text-white"}
          pageClassName={"border px-2 bg-[#F5F5F5] rounded-md"}
          forcePage={currentPage - 1}
        />
      )}
    </>
  );
};

export default Pagination;
