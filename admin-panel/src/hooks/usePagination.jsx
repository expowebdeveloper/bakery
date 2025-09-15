import React, { useState } from "react";

const usePagination = () => {
  const [page, setPage] = useState(1);
  const onPageChange = (selectedPage) => {
    // react paginated gives page inside selected object and also it is one less than the actual page
    const { selected } = selectedPage;
    const page = selected + 1;
    setPage(page);
  };
  return { page, onPageChange ,setPage};
};

export default usePagination;
