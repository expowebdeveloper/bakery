import React from "react";

const ErrorMessage = ({ fieldName, errors }) => {
  return (
    <>
      {errors?.[fieldName] && (
        <p className="error-msg">{errors?.[fieldName]?.message}</p>
      )}
    </>
  );
};

export default ErrorMessage;
