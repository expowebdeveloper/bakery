import React from "react";
import { Link } from "react-router-dom";

const AuthRedirectSection = ({ text, linkText, linkUrl, className = "" }) => {
  return (
    <div className={`redirectLink ${className}`}>
      {text} <Link to={linkUrl}>{linkText}</Link>
    </div>
  );
};

export default AuthRedirectSection;
