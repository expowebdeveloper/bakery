import React from "react";

const SignupTabs = ({
  handleTabsClick,
  activeTab,
  tabOption,
}) => {
  return (
    <>
    <h2 className="text-3xl font-medium mb-4">Sign Up!</h2>
    <div className="flex gap-4">
      <button
        type="button"
        className={`rounded-lg py-2 px-6 ${
          activeTab === tabOption.individual ? "bg-[#FF2F2F]" : ""
        }`}
        onClick={() => handleTabsClick(tabOption.individual)}
      >
        Individual
      </button>
      <button
        type="button"
        className={`rounded-lg py-2 px-6 ${
          activeTab === tabOption.company ? "bg-[#FF2F2F]" : ""
        }`}
        onClick={() => handleTabsClick(tabOption.company)}
      >
        Company
      </button>
    </div>
    </>
  );
};

export default SignupTabs;
