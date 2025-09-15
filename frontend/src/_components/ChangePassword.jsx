"use client";
import React, { useState } from "react";
import { IndivisualSignupValidations } from "@/_validations/authValidations";
import Image from "next/image";
import ErrorMessage from "./_common/ErrorMessage";
import { useForm } from "react-hook-form";
import CommonButton from "./_common/CommonButton";

const ChangePassword = ({ onPasswordChange, fieldOneName, fieldTwoName }) => {
  const formConfig = useForm();
  const {
    setValue,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    register,
    formState: { errors },
  } = formConfig;
  const [showPass, setShowPass] = useState({
    password: false,
    confirm_password: false,
  });
  const handleToglePassword = (type) => {
    setShowPass({ ...showPass, [type]: !showPass?.[type] });
  };

  const handleChangePassword = (value, type) => {
    const password = watch(fieldOneName);
    const confirmPassword = watch(fieldTwoName);
    if (type === "password" && password !== undefined) {
      if (value === confirmPassword) {
        if (confirmPassword.length) {
          clearErrors(fieldTwoName);
        }
      } else {
        if (confirmPassword?.length) {
          setError(fieldTwoName, {
            type: "manual",
            message: "password and confirm password must match",
          });
        }
      }
    }
  };

  const onSubmit = (values) => {
    onPasswordChange(values);
  };

  return (
    <div>
      <h5>Add new password</h5>
      {/* password */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <div className="label">Password</div>
          <input
            {...register(fieldOneName, {
              ...IndivisualSignupValidations?.["password"],
              onChange: (e) => {
                handleChangePassword(e.target.value, fieldOneName);
                setValue(fieldOneName, e.target.value);
              },
            })}
            type={showPass?.password ? "text" : "password"}
            placeholder={"Enter your password"}
            className={"commonInput"}
          />
          <div className="icon" onClick={() => handleToglePassword("password")}>
            <Image
              src={
                showPass?.password
                  ? "/icons/closedEye.svg"
                  : "/icons/openEye.svg"
              }
              alt="Toggle Password Visibility Icon"
              width={24}
              height={24}
            />
          </div>
          <ErrorMessage fieldName={fieldOneName} errors={errors} />
        </div>

        {/* confirm password */}
        <div>
          <div className="label">Confirm Password</div>
          <input
            {...register(fieldTwoName, {
              required: "Confirm password is required",
              validate: (value) =>
                value === watch(fieldOneName) ||
                "Password and confirm password must match",
              onChange: (e) => {
                handleChangePassword(e.target.value, fieldTwoName);
                setValue(fieldTwoName, e.target.value);
              },
            })}
            type={showPass?.confirm_password ? "text" : "password"}
            placeholder={"Confirm your password"}
            className={"commonInput"}
          />
          <div
            className="icon"
            onClick={() => handleToglePassword("confirm_password")}
          >
            <Image
              src={
                showPass?.confirm_password
                  ? "/icons/closedEye.svg"
                  : "/icons/openEye.svg"
              }
              alt="Toggle Password Visibility Icon"
              width={24}
              height={24}
            />
          </div>
          <ErrorMessage fieldName={fieldTwoName} errors={errors} />
        </div>
        <CommonButton text="Submit" type="submit" />
      </form>
    </div>
  );
};

export default ChangePassword;
