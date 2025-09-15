"use client"
import React, { useState } from "react";
import OTPInput from "react-otp-input";
import CommonButton from "./_common/CommonButton";
const numInputs = 6;

const OtpSection = ({ handleSubmitOTP,btnLoader=false }) => {
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
      <OTPInput
        value={otp}
        onChange={handleOtpInputChange}
        numInputs={numInputs} //6
        renderInput={(props) => (
          <input {...props} placeholder="-" className="otpInput" />
        )}
        isInputNum={true}
        containerStyle="OTPInputContainer"
      />
      {showErrorMsg.show && (
        <p className="error-msg">{showErrorMsg?.message}</p>
      )}
      <CommonButton
        type="button"
        text="Submit"
        className={`disabled-sign-in ${otp.length == numInputs && "sign-in-button hover:bg-orange-700"}`}
        disabled={!otp.length == numInputs || btnLoader}
        loader={btnLoader}

        onClick={() => {
          if (otp.length !== numInputs) {
            setShowErrorMsg({ show: true, message: "Please enter OTP" });
          } else {
            handleSubmitOTP(otp);
          }
        }}
      />
    </div>
  );
};

export default OtpSection;
