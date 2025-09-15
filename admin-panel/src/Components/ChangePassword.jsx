import { useState } from "react";
import { useForm } from "react-hook-form";
import { ClosedEye, OpenEye } from "../assets/Icons/Svg";
import ErrorMessage from "./Common/ErrorMessage";
import { LoginValidations } from "../Validations/loginValidations";
import { createRequiredValidation } from "../utils/helpers";
import CommonButton from "./Common/CommonButton";

const ChangePassword = ({ onPasswordChange, fieldOneName, fieldTwoName,loader }) => {
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
    <div className="space-y-6">
      <h5 className="text-3xl font-bold mb-4">Add new password</h5>
      {/* password */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="relative space-y-2 mb-4">
          <div className="label">Password</div>
          <input
            {...register(fieldOneName, {
              ...createRequiredValidation("Password"),
              onChange: (e) => {
                handleChangePassword(e.target.value, fieldOneName);
                setValue(fieldOneName, e.target.value);
              },
            })}
            type={showPass?.password ? "text" : "password"}
            placeholder={"Enter your password"}
            className={"commonInput"}
          />
          <div className="icon absolute top-10 right-2" onClick={() => handleToglePassword("password")}>
            {showPass?.password ? ClosedEye : OpenEye}
          </div>
          <ErrorMessage fieldName={fieldOneName} errors={errors} />
        </div>

        {/* confirm password */}
        <div className="relative space-y-2 mb-4">
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
            className="icon absolute top-10 right-2"
            onClick={() => handleToglePassword("confirm_password")}
          >
            {showPass?.confirm_password ? ClosedEye : OpenEye}
          </div>
          <ErrorMessage fieldName={fieldTwoName} errors={errors} />
        </div>
        <CommonButton
          text="Submit"
          type="submit"
          className="sign-in-button w-full py-3 mt-4 bg-gray-300 text-gray-600 font-semibold rounded-md hover:bg-[#5F6F52] hover:text-white rounded-[50px] cursor-pointer transition-all duration-400 ease-in-out"
          disabled={loader}
          loader={loader}
        />
      </form>
    </div>
  );
};

export default ChangePassword;
