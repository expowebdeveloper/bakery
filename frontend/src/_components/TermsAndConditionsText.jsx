import React from "react";
import ErrorMessage from "./_common/ErrorMessage";
import { T } from "@/utils/languageTranslator";

const TermsAndConditionsText = ({ fieldName, register, rules, errors, isLogin = false }) => {
  return (
    <div>
      <div className="flex gap-3 items-start">
        <input type="checkbox" className="mt-1" {...register(fieldName, rules)} />
        <div className="terms_and_condition_text lh-1">
          {isLogin ? T["login_terms_and_conditions"] : T["terms_and_conditions_text"]}
          {" "}
        <a className="link">{T["terms_of_use"]} </a>and <a className="link">{T["privacy_policy"]}</a>
        </div>
      </div>
      <ErrorMessage fieldName={fieldName} errors={errors} />
    </div>
  );
};

export default TermsAndConditionsText;
