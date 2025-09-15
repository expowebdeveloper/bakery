"use client"
import React from 'react'
import EmailInput from '@/_form-fields/EmailInput'
import CommonButton from './_common/CommonButton';
import { IndivisualSignupValidations } from '@/_validations/authValidations';

const EmailVerification = ({ onSubmit, formConfig,btnLoader=false }) => {
  const { handleSubmit, formState: { isValid } } = formConfig;
  console.log(isValid,"isValid")
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        <EmailInput
          fieldName="email"
          formConfig={formConfig}
          type="text"
          placeholder="Enter your email"
          className="common-field text-black"
          rules={IndivisualSignupValidations["email"]}
          label="Email Address"
        // handleVerifyClick={handleVerifyClick}
        // isVerified={isVerified}
        />
        <CommonButton
          type="submit"
          text="Verify"
          className={`disabled-sign-in ${isValid && "sign-in-button hover:bg-orange-700"}`}
          disabled={!isValid || btnLoader}
          loader={btnLoader}
        />
      </form>
    </>
  )
}

export default EmailVerification