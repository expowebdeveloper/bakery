"use client"
import { addressIcon, emailIcon, phoneIcon } from '@/assets/Icons/Svg';
import Image from 'next/image';
import React, { useState } from 'react';
import PatternBread from '../../../public/images/pattern-bread.png';
import { useForm } from 'react-hook-form';
import { createRequiredValidation } from '@/utils/helpers';
import CommonTextInput from '@/_form-fields/CommonTextInput';
import { T } from '@/utils/languageTranslator';
import { EMAIL_REGEX } from '@/_validations/authValidations';
import { PHONE_REGEX } from '@/_constants/constant';
import { callApi } from '@/_Api Handlers/apiFunctions';
import { CONTACT_ENDPOINT } from '@/_Api Handlers/endpoints';
import { toastMessage } from '@/_utils/toastMessage';
import CommonButton from '@/_components/_common/CommonButton';
const ContactUs = () => {
  const formConfig = useForm();
  const [buttonLoader, setButtonLoader] = useState(false);
  const { handleSubmit } = formConfig;
  const onSubmit = (data) => {
    console.log(data, "contact data");
    setButtonLoader((prev) => true);
    callApi({ endPoint: CONTACT_ENDPOINT, method: "POST", payload: data }).then((re) => {
      console.log(re, "contact response");
      toastMessage(T["contact_success"], "success")
      formConfig.reset();
    }).catch((err) => {
      toastMessage(err?.response?.data?.detail || T["something_went_wrong"])
    }).finally(() => {
      setButtonLoader((prev) => false);
    })
  }
  return (
    <div>
      <div
        className="min-h-[100px] flex items-center justify-center flex-col text-[20px] bg-gradient-to-r from-[#FFFDF4] to-[#FFE8CC] py-6"
      >
        <h3 className='text-center mb-5 text-[30px] text-black font-bold'>Contact</h3>
        <div className="container text-center mx-auto px-6">
          {`Home > Contact`}
        </div>
      </div>
      <div className='relative'>
        <Image src={PatternBread} className="pattern-bread" />
        <div className="container mx-auto p-8 ">

          {/* Contact Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-12">
            <div className="border p-6 rounded-lg shadow-lg">
              <div className="flex justify-center items-center mb-4 contact-icon">
                {emailIcon}
              </div>
              <h3 className="font-bold text-lg text-customOrange mb-3">Email Address</h3>
              <p>info@webmail.com</p>
              <p>jobs@webexample.com</p>
            </div>
            <div className="border p-6 rounded-lg shadow-lg">
              <div className="flex justify-center items-center mb-4 contact-icon">
                {phoneIcon}
              </div>
              <h3 className="font-bold text-lg text-customOrange mb-3">Phone Number</h3>
              <p>+0123-456789</p>
              <p>+987-6543210</p>
            </div>
            <div className="border p-6 rounded-lg shadow-lg">
              <div className="flex justify-center items-center mb-4 contact-icon">
                {addressIcon}
              </div>
              <h3 className="font-bold text-lg text-customOrange mb-3">Office Address</h3>
              <p>18/A, New Born Town Hall</p>
              <p>New York, US</p>
            </div>
          </div>

          {/* Get a Queue Section */}
          <div className="bg-[#FFE8CC] p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Get a Queue</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <CommonTextInput className='border p-4 rounded-lg' formConfig={formConfig} rules={createRequiredValidation(T["name"])} fieldName="name" placeholder={T["enter_your_name"]} />
                {/* <input type="text" placeholder="Enter your name" className="border p-4 rounded-lg" /> */}
                <CommonTextInput className='border p-4 rounded-lg' formConfig={formConfig} rules={{
                  ...createRequiredValidation(T["email"]),
                  pattern: {
                    value: EMAIL_REGEX,
                    message: T["invalid_email"]
                  }
                }} fieldName="email" placeholder={T["enter_email_address"]} />

                <CommonTextInput className='border p-4 rounded-lg' formConfig={formConfig} rules={{
                  ...createRequiredValidation(T["phone_number"]),
                  pattern: {
                    value: PHONE_REGEX,
                    message: T["invalid_number"]
                  }
                }} fieldName="contact_no" placeholder={T["enter_phone_number"]} />
                <CommonTextInput className='border p-4 rounded-lg' type='textarea' rows={4} formConfig={formConfig} rules={createRequiredValidation(T["message"])} fieldName="message" placeholder={T["enter_message"]} />

                {/* <input type="email" placeholder="Enter email address" className="border p-4 rounded-lg" />
                <input type="tel" placeholder="Enter phone number" className="border p-4 rounded-lg" /> */}
                {/* <textarea placeholder="Enter message" className="border p-4 rounded-lg col-span-2" rows="4"></textarea> */}
              </div>
              <div className='text-center'>
                <CommonButton disabled={buttonLoader} text={T["submit"]} loader={buttonLoader} type="submit" className="bg-btnBackground text-white px-6 min-w-[180px] py-4 rounded-full hover:bg-orange-700 transition duration-300 text-uppercase tracking-widest font-semibold inline-flex justify-center mt-5 items-center" ></CommonButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
