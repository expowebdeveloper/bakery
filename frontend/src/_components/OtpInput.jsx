"use client";
import React, { useState } from "react";
import CommonButton from "./_common/CommonButton";
import OTPInput from "react-otp-input";

const OtpInput = ({ handleSubmitOTP }) => {
  const [otp, setOtpValue] = useState("");
  const [loader, setLoader] = useState(false);
  const [showErrorMsg, setShowErrorMsg] = useState({
    show: false,
    msg: "",
  });

  const handleOtpInputChange = (otp) => {
    if (isNaN(otp)) return;
    setOtpValue(otp);
    if (showErrorMsg.show) {
      setShowErrorMsg({ show: false, msg: "" });
    }
  };
  return (
    <div>
      {" "}
      <p>Enter the verification code we sent to your email address. </p>
      <form>
        <OTPInput
          value={otp}
          onChange={handleOtpInputChange}
          numInputs={6}
          renderInput={(props) => (
            <input {...props} placeholder="-" className="otpInput" />
          )}
          isInputNum={true}
          containerStyle="OTPInputContainer"
        />
        {showErrorMsg.show && (
          <p className="error-msg">{showErrorMsg?.message}</p>
        )}
        <CommonButton type="button" text="Submit" onClick={handleSubmitOTP} />
      </form>
    </div>
  );
};

export default OtpInput;
