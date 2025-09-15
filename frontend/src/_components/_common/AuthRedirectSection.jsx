import Link from "next/link";
import React from "react";

const AuthRedirectSection = ({ text, linkText, linkUrl, className = "" }) => {
  return (
    <div className={`redirectLink ${className}`}>
      {text} <Link href={linkUrl}>{linkText}</Link>
    </div>
  );
};

export default AuthRedirectSection;
