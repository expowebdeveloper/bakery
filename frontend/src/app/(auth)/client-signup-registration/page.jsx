"use client";
import { callApi, METHODS, signUp, verifyEmail, verifyEmailOTP } from "@/_Api Handlers/apiFunctions";
import SignupForm from "@/_components/SignupForm";
import { DEFAULT_ERROR_MESSAGE } from "@/_constants/constant";
import { toastMessage } from "@/_utils/toastMessage";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { successType } from "@/_utils/toastMessage";
import { useRouter, useSearchParams } from "next/navigation";
import EmailVerification from "@/_components/EmailVerification";
import OtpSection from "@/_components/OtpSection";
import PageLoader from "@/loaders/PageLoader";

const TABS_OPTIONS = {
  individual: "individual",
  company: "company",
};
const SignUp = ({ searchParams }) => {
  const formConfig = useForm();
  const [activeTab, setActiveTab] = useState(TABS_OPTIONS?.individual);
  const [pageLoader, setPageLoader] = useState(false);
  const [btnLoader, setBtnLoader] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState();
  const [passwordUpdatePayload, setPasswordUpdatePayload] = useState({
    otp: "",
    email: "",
  });

  const router = useRouter();
  // const searchParams = useSearchParams();
  // const paramToken = searchParams?.get("token");


  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlSearchParams = new URLSearchParams(window.location.search);
    const paramToken = urlSearchParams.get("token");

    if (!paramToken) {
      router.replace("/login");
      return;
    }

    setPageLoader(true);
    callApi({
      endPoint: "/bakery/register/",
      method: METHODS.get,
      params: { token: paramToken }
    })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err, "verification error");
        const errorMessage = err?.response?.data?.error;
        toastMessage(errorMessage);
        router.push("/login");
      })
      .finally(() => {
        setPageLoader(false);
      });
  }, [router]);


  const handleVerifyClick = () => {
    setIsModalOpen(true);
  };

  const handleTabsClick = (selectedTab) => {
    formConfig.reset({
      company_name: "",
      // email: "",
      password: "",
      confirm_password: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      terms_and_conditions: false,
    });
    setActiveTab(selectedTab);
  };

  const handleVerify = (values) => {
    setBtnLoader((prev) => true);
    setPasswordUpdatePayload({
      ...passwordUpdatePayload,
      email: values?.email,
    });
    const { email } = values;

    const payload = {
      email: email,
    };

    verifyEmail(payload)
      .then((res) => {
        setStep("otp");
        toastMessage(
          "Verification email has been sent successfully",
          successType
        );
      })
      .catch((err) => {
        console.log(err, "this is error")
        const emailError = err?.response?.data?.email?.[0];
        toastMessage(emailError || DEFAULT_ERROR_MESSAGE);
        router.replace("/login");
      }).finally(() => {
        setBtnLoader((prev) => false);
      });
  };

  const handleSubmitOTP = (otp) => {
    setBtnLoader((prev) => true);
    setPasswordUpdatePayload({ ...passwordUpdatePayload, otp: otp });

    const payload = {
      otp: otp,
      email: passwordUpdatePayload?.email,
    };
    verifyEmailOTP(payload)
      .then((res) => {
        toastMessage("OTP verified successfully", successType);
        setStep("signup-form");
      })
      .catch((err) => {
        // update required: add invalid otp message according to the api response
        toastMessage(err?.response?.data?.error || DEFAULT_ERROR_MESSAGE);
      }).finally(() => {
        setBtnLoader((prev) => false);
      });
  };

  const onSubmit = (values) => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const paramToken = urlSearchParams.get("token");

    const {
      company_name,
      email,
      password,
      first_name,
      last_name,
      phone_number,
      terms_and_conditions,
      email_marketing,
    } = values;
    // update required : Confirm about city,state and country key values

    // for extracting state , city and country from address
    // const { state, city, country } = returnAddressInfo(
    //   address?.address_components
    // );

    const payload = {
      name: `${first_name} ${last_name}`,
      contact_no: phone_number,
      term_condition: terms_and_conditions,
      email_reminders: email_marketing,
      user: {
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: password,
        role: "bakery",
      },
      token: paramToken,
      vat_id: values?.vat_id,
      organization_no: +values?.organization_no,

      // address: "123 Bakery St",
      // city: "Bakerstown",
      // state: "CA",
      // country: "SE",
      // zipcode: "12345",
      // primary: true,
      ...(company_name && { company_name: company_name }),
    };
    setBtnLoader((prev) => true);
    console.log(payload, "this is payload");

    signUp(payload)
      .then((res) => {
        toastMessage("User registered succesfully", successType);
        router.push("/login");
      })
      .catch((err) => {
        const error = err?.response?.data?.user?.email?.[0] || err?.response?.data?.vat_id?.[0] || err?.response?.data?.organization_no?.[0];
        toastMessage(error || DEFAULT_ERROR_MESSAGE);
      }).finally(() => {
        setBtnLoader((prev) => false);
      });
  };

  return (
    <div>
      {pageLoader && <PageLoader />}
      {step !== "signup-form" && step !== "otp" && (
        <>
          <EmailVerification onSubmit={handleVerify} formConfig={formConfig} btnLoader={btnLoader} />
        </>
      )}
      {step === "otp" && <OtpSection handleSubmitOTP={handleSubmitOTP} btnLoader={btnLoader} />}
      {step === "signup-form" && (
        <>
          {/* <SignupTabs
            activeTab={activeTab}
            handleTabsClick={handleTabsClick}
            tabOption={TABS_OPTIONS}
          /> */}

          <SignupForm
            formConfig={formConfig}
            activeTab={activeTab}
            tabOption={TABS_OPTIONS}
            onSubmit={onSubmit}
            isVerified={isVerified}
            handleVerifyClick={handleVerifyClick}
            btnLoader={btnLoader}
          />
        </>
      )}
    </div>
  );
};

export default SignUp;
