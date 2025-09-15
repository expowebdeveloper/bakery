import React from "react";

const ErrorMessage = ({ fieldName, errors, customError = "" }) => {
  return (
    <>
      {customError ? (
        <p className="text-red-600 error-text">{customError}</p>
      ) : (
        errors?.[fieldName] && (
          <p className="text-red-600 error-text">{errors?.[fieldName].message}</p>
        )
      )}
    </>
  );
};

export default ErrorMessage;
