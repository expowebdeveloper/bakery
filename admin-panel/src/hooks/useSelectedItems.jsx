import React, { useState } from "react";

const useSelectedItems = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const handleSelectItems = (id, isSelectAll) => {
    // if the id is already in the array then remove it else add it
    setSelectedItems((prev) => {
      if (prev.includes(id)) {
        return prev.filter((el) => el !== id);
      }
      return [...prev, id];
    });
  };
  const selectAllItems = (e, stateValue) => {
    const { checked } = e.target;
    if (checked) {
      setSelectedItems(stateValue?.map((el) => el?.id));
    } else {
      setSelectedItems([]);
    }
  };
  return { selectedItems, setSelectedItems, handleSelectItems, selectAllItems };
};

export default useSelectedItems;
