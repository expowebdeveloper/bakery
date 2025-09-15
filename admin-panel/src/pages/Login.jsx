import { useState } from "react";
import { LoginValidations } from "../Validations/loginValidations";
import { useForm } from "react-hook-form";
import CommonTextField from "../Form Fields/CommonTextField";
import { ClosedEye, OpenEye } from "../assets/Icons/Svg";
import { login } from "../api/apiFunctions";
import { toastMessage } from "../utils/toastMessage";
import CommonButton from "../Components/Common/CommonButton";
import { ROLES } from "../constant";
import { T } from "../utils/languageTranslator";
import { useProfile } from "../contexts/ProfileProvider";

const Login = () => {
  const formConfig = useForm();
  const { updateProfile } = useProfile();
  const {
    handleSubmit,
    formState: { isValid },
  } = formConfig;
  const [showPassword, setShowPassword] = useState(false);
  const [btnLoader, setBtnLoader] = useState(false);
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  const allowedRoles = [
    ROLES?.accountManager,
    ROLES?.admin,
    ROLES?.stockManager,
  ];
  const onSubmit = (values) => {
    setBtnLoader((prev) => true);
    login(values)
      .then((res) => {
        const role = res?.data?.role;
        console.log(res?.data, "this is response");
        // const role = ROLES?.stockManager;
        if (!allowedRoles.includes(role)) {
          toastMessage("Invalid email or password");
          return;
        }
        localStorage.setItem("token", res?.data?.access);
        localStorage.setItem("refreshToken", res?.data?.refresh);
        localStorage.setItem("role", role);
        console.log(res?.data, "resdata");
        // commented for future use
        localStorage.setItem("user_id", res?.data?.id);

        const userName = `${res?.data?.first_name} ${res?.data?.last_name}`;
        localStorage.setItem("userName", userName);
        localStorage.setItem("email", res?.data?.email);
        const profile = {
          first_name: res?.data?.first_name,
          last_name: res?.data?.last_name,
          profile_picture: res?.data?.profile?.profile_picture,
        };
        updateProfile(profile);
        handleNavigate(role);
      })
      .catch((err) => {
        const fieldError =
          err?.response?.data?.non_field_errors?.[0] ||
          err?.response?.data?.email?.[0];
        if (fieldError) {
          toastMessage(fieldError || DEFAULT_ERROR_MESSAGE);
        }
      })
      .finally(() => setBtnLoader((prev) => false));
  };
  const handleNavigate = (role) => {
    if (role === ROLES?.admin) {
      window.location.href = "/dashboard";
    } else if (role === ROLES?.accountManager) {
      window.location.href = "/orders-management";
    } else if (role === ROLES?.stockManager) {
      window.location.href = "/products";
    } else {
      window.location.href = "/dashboard";
    }
  };
  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="login-form w-full max-w-[450px]"
      >
        <h2 className="text-3xl font-bold mb-4">Login!</h2>
        <CommonTextField
          fieldName="email"
          formConfig={formConfig}
          type="text"
          placeholder={T["enter_email"]}
          rules={LoginValidations["email"]}
          label={`${T["email_address"]} *`}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
          labelClassName="block text-sm font-medium mb-2"
        />
        <CommonTextField
          fieldName="password"
          formConfig={formConfig}
          placeholder={T["enter_password"]}
          rules={LoginValidations["password"]}
          label={`${T["your_password"]} *`}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
          labelClassName="block text-sm font-medium mb-2"
          type={showPassword ? "text" : "password"}
          onIconClick={toggleShowPassword}
          icon={showPassword ? ClosedEye : OpenEye}
          showTooltip={true}
        />
        <CommonButton
          text={T["sign_in"]}
          type="submit"
          loader={btnLoader}
          className={`disabled-sign-in ${isValid && "sign-in-button"}`}
          disabled={!isValid || btnLoader}
        />
        {/* commented for future  use */}
        {/* <SocialLogin
          afterAPISuccess={() => {
            afterAPISuccess;
          }}
        /> */}
      </form>
    </>
  );
};

export default Login;
