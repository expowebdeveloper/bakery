import React, { useState } from "react";

const useModalToggle = () => {
  const [showModal, setShowModal] = useState();
  const toggleModal = () => {
    setShowModal((prev) => !prev);
  };
  return { showModal, toggleModal };
};

export default useModalToggle;
