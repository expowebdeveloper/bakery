import React, { useState } from "react";
import OTPInput from "react-otp-input";
import CommonButton from "./Common/CommonButton";
const numInputs = 6;

const OtpSection = ({ handleSubmitOTP,loader }) => {
  const [otp, setOtpValue] = useState("");
  // const [loader, setLoader] = useState(false);
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
      <p className="font-bold mb-6">Enter the verification code we sent to your email address. </p>
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
        disabled={loader}
        loader={loader}
        className="sign-in-button w-full py-3 mt-4 bg-gray-300 text-gray-600 font-semibold rounded-md hover:bg-[#5F6F52] hover:text-white rounded-[50px] cursor-pointer transition-all duration-400 ease-in-out"
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
