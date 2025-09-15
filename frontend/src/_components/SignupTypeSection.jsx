import React, { useState } from "react";

const SignupTypeSection = ({ setSignUpType, signUpType }) => {
  const [selectedOption, setSelectedOption] = useState("");
  return (
    <div>
      <div className="selection-container">
        <div
          className={`indivisual-signup ${
            selectedOption == "indivisual" ? "selected" : ""
          }`}
          onClick={() => setSelectedOption("indivisual")}
        >
          Sign Up as an indivisual
        </div>
        <div
          className={`company-signup ${
            selectedOption == "company" ? "selected" : ""
          }`}
          onClick={() => setSelectedOption("company")}
        >
          Sign Up as an company
        </div>
      </div>
      {selectedOption && (
        <button
          className="px-5 py-2.5 rounded-full text-white text-sm tracking-wider font-medium border border-current outline-none bg-[#e5e5e5]  active:bg-[#333]"
          onClick={() => setSignUpType(selectedOption)}
        >
          Continue
        </button>
      )}
    </div>
  );
};

export default SignupTypeSection;
