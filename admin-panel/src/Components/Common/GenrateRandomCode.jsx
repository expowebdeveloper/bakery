import React from "react";
import { generateRandomCode } from "../../utils/helpers";

const GenrateRandomCode = ({ fieldName, setValue }) => {
  const handleGenerateCode = () => {
    const randomCode = generateRandomCode();
    setValue(fieldName, randomCode, { shouldValidate: true });
  };
  return (
    <div
      className="text-[#FF6D2F] underline cursor-pointer text-[14px]"
      onClick={handleGenerateCode}
    >
      Generate Random Code
    </div>
  );
};

export default GenrateRandomCode;
