// import {
//   changePassword,
//   sendEmailOtp,
//   verifyOtp,

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import OtpSection from "../Components/OtpSection";
import CommonTextField from "../Form Fields/CommonTextField";
import { LoginValidations } from "../Validations/loginValidations";
import CommonButton from "../Components/Common/CommonButton";
import { changePassword, sendEmailOtp, verifyOtp } from "../api/apiFunctions";
import { successType, toastMessage } from "../utils/toastMessage";
import ChangePassword from "../Components/ChangePassword";
import { DEFAULT_ERROR_MESSAGE } from "../constant";

// } from "@/_Api Handlers/apiFunctions";
const ForgetPassword = () => {
  const navigate = useNavigate();
  const formConfig = useForm();
  const { handleSubmit, watch } = formConfig;
  const [step, setStep] = useState();
  // storing email and otp for last step
  const [passwordUpdatePayload, setPasswordUpdatePayload] = useState({
    otp: "",
    email: "",
  });
  const [loader, setLoader] = useState();

  // for step 1 (send otp)
  const onSubmit = (values) => {
    setLoader(true);
    setPasswordUpdatePayload({
      ...passwordUpdatePayload,
      email: values?.email,
    });
    sendEmailOtp(values)
      .then((res) => {
        setStep("otp");
        toastMessage("OTP Sent successfully to your email", successType);
      })
      .catch((err) => {
        // check which field is there for invalid email address
        toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
      })
      .finally(() => {
        setLoader(false);
      })
  };

  // step 2:verify otp
  const handleSubmitOTP = (otp) => {
    setLoader(true);
    setPasswordUpdatePayload({ ...passwordUpdatePayload, otp: otp });
    // toastMessage("OTP verified successfully", successType);
    // setStep("password-change");
    const payload = {
      otp: otp,
      email: passwordUpdatePayload?.email,
    };
    verifyOtp(payload)
      .then((res) => {
        toastMessage("OTP verified successfully", successType);
        setStep("password-change");
      })
      .catch((err) => {
        // update required: add invalid otp message according to the api response
        console.log(err, "otp verify error");
        toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
      })
      .finally(() => {
        setLoader(false);
      })
  };

  // step 2:update password

  const onPasswordChange = (values) => {
    setLoader(true);
    const { password } = values;
    const payload = {
      email: passwordUpdatePayload?.email,
      new_password: password,
    };
    changePassword(payload)
      .then((res) => {
        toastMessage("Password updated successfully", successType);
        navigate("/dashboard");
      })
      .catch((err) =>
        toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE)
      )
      .finally(() => {
        setLoader(false);
      })
  };

  return (
    <div className="login-form w-full max-w-[450px] space-y-6">
      {step !== "password-change" && step !== "otp" && (
        <>
          <h3 className="text-3xl font-bold mb-4">Forgot your Password?</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            <CommonTextField
              fieldName="email"
              formConfig={formConfig}
              type="text"
              placeholder="Enter Email"
              rules={LoginValidations["email"]}
              label="Email address"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            />
            <CommonButton
              text="Send OTP"
              type="submit"
              className="sign-in-button w-full py-3 mt-4 bg-gray-300 text-gray-600 font-semibold rounded-md hover:bg-[#5F6F52] hover:text-white rounded-[50px] cursor-pointer transition-all duration-400 ease-in-out"
              disabled={loader}
              loader={loader}
            />
          </form>
        </>
      )}
      {step === "otp" && <OtpSection handleSubmitOTP={handleSubmitOTP} loader={loader}/>}
      {step === "password-change" && (
        <ChangePassword
          onPasswordChange={onPasswordChange}
          fieldOneName="password"
          fieldTwoName="confirm_password"
          loader={loader}
        />
      )}
    </div>
  );
};

export default ForgetPassword;
