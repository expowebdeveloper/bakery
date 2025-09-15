import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  GoogleLogin,
  GoogleOAuthProvider,
  useGoogleLogin,
} from "@react-oauth/google";
import { toastMessage } from "../utils/toastMessage";
import { DEFAULT_ERROR_MESSAGE } from "../constant";
import { googleIcon } from "../assets/Icons/Svg";
import { authAxios, googleClientID } from "../api/apiConfig";

const SocialLogin = ({ afterAPISuccess }) => {
  const navigate = useNavigate();

  //   const handleLoginWithGoogle = useGoogleLogin({
  //     onSuccess: async (tokenResponse) => {
  //       try {
  //         const url = "/accounts/google-login/";
  //         handleSocialAppLogin(tokenResponse.access_token, url);
  //       } catch (error) {
  //         console.error("Google error:", error);
  //         toastMessage(error);
  //       }
  //     },
  //   });

  const handleSocialAppLogin = (token, url) => {
    authAxios
      .post(url, {
        token: token,
      })
      .then((res) => {
        console.log(res, "this is response");
      })
      .catch((err) => {
        console.log(err, "social login error");
        const erroMessage = err?.response?.data?.message
          ? err.response.data.message
          : DEFAULT_ERROR_MESSAGE;
        toastMessage(erroMessage);
      });
  };
  const handleLoginSuccess = (url,token) => {
    console.log(url,"url");
    console.log(token,"asd")
  };
  const handleLoginFailure = () => {};
  return (
    <div className="sign-options">
      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-gray-500">OR</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <button
        type="button"
        onClick={() => {}}
        className="w-full py-3 flex items-center justify-center border border-gray-300 hover:bg-gray-100 rounded-[50px]"
      >
        <div className="w-5 h-5 mr-2">{googleIcon}</div>
        Continue with Google
      </button>
      <GoogleOAuthProvider clientId={googleClientID}>
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={handleLoginFailure}
          render={(renderProps) => (
            <button
              type="button"
              onClick={() => {}}
              className="w-full py-3 flex items-center justify-center border border-gray-300 hover:bg-gray-100 rounded-[50px]"
            >
              <div className="w-5 h-5 mr-2">{googleIcon}</div>
              Continue with Google
            </button>
          )}
        />
      </GoogleOAuthProvider>
    </div>
  );
};

export default SocialLogin;
