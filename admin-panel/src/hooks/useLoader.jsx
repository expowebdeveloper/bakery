import React, { useState } from "react";

const useLoader = () => {
  const [pageLoader, setPageLoader] = useState(false);
  // for sections containing pair of button loaders like for publish-draft
  const [buttonLoader, setButtonLoader] = useState({
    grey_btn: false,
    orange_btn: false,
  });
  const [deleteLoader, setDeleteLoader] = useState(false);
  const toggleLoader = (type, smallLoaderType = null) => {
    if (type === "buttonLoader") {
      setButtonLoader({
        ...buttonLoader,
        [smallLoaderType]: !buttonLoader[smallLoaderType],
      });
    } else if (type === "deleteLoader") {
      setDeleteLoader((prev) => !prev);
    } else {
      setPageLoader((prev) => !prev);
    }
  };
  return { pageLoader, toggleLoader, buttonLoader, deleteLoader, setPageLoader };
};

export default useLoader;
