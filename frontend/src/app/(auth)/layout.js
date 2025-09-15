import Image from "next/image";
import React from "react";

const AuthLayout = ({ children }) => {
  return (
    <div>
      <div className="login-container">
        <div className="section1 w-3/6 h-screen relative">
          <Image
            src={"/images/login-image.png"}
            alt="auth image"
            className="w-full h-full object-cover"
            width={500}
            height={20}
            priority={false}
          />
          <div className="absolute top-1/2 -translate-y-1/2 flex flex-col gap-4 p-[70px]">
            <span className="inline-block w-12 h-12 rounded-full bg-white"></span>
            <h2 className="text-[36px] text-white font-semibold">Your Freshly Baked Swedish Breads Await!</h2>
            <p className="mb-0 text-[18px] text-white font-normal">Sign in to enjoy the finest Swedish breads, baked fresh just for you. From sourdough to traditional loaves, your next delicious order is just a click away. Not a member? Sign up for faster checkout and exclusive offers!</p>
          </div>
        </div>
        <div className="section2n auth-form-details w-3/6 h-screen overflow-y-auto flex flex-col p-10">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
