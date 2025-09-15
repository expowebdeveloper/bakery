"use client";
import AuthRedirectSection from "@/_components/_common/AuthRedirectSection";
import CommonTextInput from "@/_form-fields/CommonTextInput";
import { LoginValidations } from "@/_validations/authValidations";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import CommonButton from "@/_components/_common/CommonButton";
import { callApi, login, METHODS } from "@/_Api Handlers/apiFunctions";
import { useRouter } from "next/navigation";
import { successType, toastMessage } from "@/_utils/toastMessage";
import { manageUserAuthorization } from "@/_utils/helpers";
import { DEFAULT_ERROR_MESSAGE } from "@/_constants/constant";
import TermsAndConditionsText from "@/_components/TermsAndConditionsText";
import { SEND_CODE_ENDPOINT, VERIFY_CODE_ENDPOINT } from "@/_Api Handlers/endpoints";
import { createRequiredValidation } from "@/utils/helpers";
import { T } from "@/utils/languageTranslator";
import OtpSection from "@/_components/OtpSection";

const Login = () => {
  const router = useRouter();
  const [values, setValues] = useState({});
  const [buttonLoader, setButtonLoader] = useState(false);
  const [step, setStep] = useState("login");

  const formConfig = useForm();
  const { handleSubmit, register, formState: { errors, isValid },
  } = formConfig;
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = (values) => {
    setButtonLoader((prev) => true);
    login(values).then((res) => {
      handleSendVerificationCode(values);
    }).catch((err) => {
      const fieldError =
        err?.response?.data?.non_field_errors?.[0] ||
        err?.response?.data?.email?.[0] || err?.response?.data?.non_field_errors[0];
      toastMessage(fieldError || DEFAULT_ERROR_MESSAGE);
      setButtonLoader((prev) => false);

    }).finally(() => {
    });
  };

  const handleLogin = () => {
    setButtonLoader((prev) => true);
    login(values)
      .then((res) => {
        manageUserAuthorization({
          action: "add",
          token: res?.data?.access,
          refreshToken: res?.data?.refresh,
          firstName: res?.data?.first_name,
          lastName: res?.data?.last_name,
          rememberMe: values.rememberMe,
        });

        if (values.rememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }

        let isCheckout = localStorage.getItem("isCheckout");
        if (isCheckout) {
          localStorage.removeItem("isCheckout");
          router.push("/billing");
        } else {
          router.push("/");
        }
      })
      .catch((err) => {
        toastMessage(
          err?.response?.data?.non_field_errors[0] || DEFAULT_ERROR_MESSAGE
        );
      }).finally(() => {
        setButtonLoader((prev) => false);
      });
  }

  const handleSendVerificationCode = (values) => {
    setButtonLoader((prev) => true);
    console.log(values, "iniside send ")
    callApi({ endPoint: SEND_CODE_ENDPOINT, method: METHODS.post, payload: { email: values?.email } }).then((res) => {
      console.log(res, "this is res")
      toastMessage(res?.data?.message || T["otp_sent_successfully"], successType);
      setValues(values);
      setStep("verify")
    }).catch((err) => {
      console.log(err, "thi i err")
    }).finally(() => {
      setButtonLoader((prev) => false)
    })
  }
  const handleSubmitOTP = (code) => {
    setButtonLoader((prev) => true);
    callApi({
      endPoint: VERIFY_CODE_ENDPOINT,
      method: METHODS.post,
      payload: { email: values.email, otp: code },
    })
      .then((res) => {
        handleLogin(); // Call login after successful OTP verification
      })
      .catch((err) => {
        console.log(err, "err")
        const error = err?.response?.data?.detail || err?.response?.data?.email?.[0] || DEFAULT_ERROR_MESSAGE;
        toastMessage(error);
      })
      .finally(() => (false));
  };


  return (
    <>
      {
        step === "login" ? (
          <form
          onSubmit={handleSubmit(onSubmit)}
          className="login-form w-full"
        >
          <h2 className="text-3xl font-medium mb-4">Login!</h2>
          <CommonTextInput
            fieldName="email"
            formConfig={formConfig}
            type="text"
            placeholder="Enter Email"
            rules={LoginValidations["email"]}
            label="Username or email address"
            className="w-full common-field mb-4"
          />
          <CommonTextInput
            fieldName="password"
            formConfig={formConfig}
            placeholder="Enter Password"
            rules={LoginValidations["password"]}
            label="Your password"
            type={showPassword ? "text" : "password"}
            onIconClick={toggleShowPassword}
            className="w-full common-field mb-4"
            icon={
              <Image
                src={showPassword ? "/icons/closedEye.svg" : "/icons/openEye.svg"}
                alt="Toggle Password Visibility Icon"
                width={24}
                height={24}
              />
            }
          />
          <div className="flex items-center mb-4">
            <input
              id="rememberMe"
              type="checkbox"
              {...register("rememberMe")}
              className="mr-2"
            />
            <label htmlFor="rememberMe">Remember Me</label>
          </div>

            <TermsAndConditionsText
              register={formConfig?.register}
              rules={createRequiredValidation(T["terms_conditions_validation_message"])}
              fieldName="terms_and_conditions"
              errors={errors}
              isLogin={true}
            />{" "}

            <AuthRedirectSection
              text=""
              linkText="Forgot your password"
              linkUrl="/forget-password"
              className="text-right"
            />

            <CommonButton
              type="submit"
              className={`disabled-sign-in ${isValid && "sign-in-button"}`}
              text="Sign in"
              disabled={!isValid || buttonLoader}
              loader={buttonLoader}
            />


            {/* <AuthRedirectSection
          text="Don't have an account? "
          linkText="Sign up"
          linkUrl="/client-signup-registration"
        /> */}
          </form>
        ) : ""
      }
      {step === "verify" ? <OtpSection btnLoader={buttonLoader} handleSubmitOTP={handleSubmitOTP} /> : ""}
    </>
  );
};

export default Login;
