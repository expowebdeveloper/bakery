import { INSTANCE } from "@/_Api Handlers/apiConfig";
import { callApi } from "@/_Api Handlers/apiFunctions";
import { PROFILE_UPDATE } from "@/_Api Handlers/endpoints";
import React, { useState } from "react";

const ProfileSetting = ({profileData,handleProfileData}) => {
  const [smsPreferences, setSmsPreferences] = useState({
    recommendations: profileData?.sms_reminders,
  });

  const [emailPreferences, setEmailPreferences] = useState({
    recommendations: profileData?.email_reminders,
    newsletter: profileData?.newletter_reminders,
  });


  const handleToggle = (type, preference) => {
    if (type === "sms") {
      setSmsPreferences((prev) => {
        const newPreferences = {
          ...prev,
          [preference]: !prev[preference],
        };
        
        const payload = {
          sms_reminders: newPreferences.recommendations,
          email_reminders: emailPreferences?.recommendations,
          newletter_reminders: emailPreferences?.newsletter,
        };
        
        callApi({
          endPoint: PROFILE_UPDATE,
          method: "PATCH",
          instanceType: INSTANCE?.authorized,
          payload: payload,
        })
          .then((res) => {
            handleProfileData();
            toastMessage("Profile updated successfully", "success");
          })
          .catch((error) => {
            console.error("Error updating profile:", error);
          });
  
        return newPreferences;
      });
    } else if (type === "email") {
      setEmailPreferences((prev) => {
        const newPreferences = {
          ...prev,
          [preference]: !prev[preference],
        };
  
        const payload = {
          sms_reminders: smsPreferences?.recommendations,
          email_reminders: newPreferences?.recommendations,
          newletter_reminders: newPreferences?.newsletter,
        };
  
        callApi({
          endPoint: PROFILE_UPDATE,
          method: "PATCH",
          instanceType: INSTANCE?.authorized,
          payload: payload,
        })
          .then((res) => {
            handleProfileData();
            toastMessage("Profile updated successfully", "success");
          })
          .catch((error) => {
            console.error("Error updating profile:", error);
          });
  
        return newPreferences;
      });
    }
  };
  
  return (
    <div className="w-full">
      <h2 className="text-2xl font-extrabold text-black mb-6">Settings</h2>

      {/* SMS Preferences */}
      <div className="mb-6">
        <h3 className="text-lg font-extrabold text-black mb-3">
          SMS Preferences
        </h3>
        <div className="flex justify-between items-center p-4 rounded-lg border border-gray-200">
          <div>
            <p className="font-semibold text-black">
              Recommendations & Reminders
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Keep this on to receive offer recommendations & timely reminders
              based on your interests
            </p>
          </div>
          <div
            onClick={() => handleToggle("sms", "recommendations")}
            className={`relative inline-block w-12 h-6 rounded-full transition duration-300 ease-in-out cursor-pointer ${
              smsPreferences?.recommendations ? "bg-[#4BAF50]" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${
                smsPreferences?.recommendations ? "transform translate-x-6" : ""
              } bg-white`}
            ></span>
          </div>
        </div>
      </div>

      {/* Email Preferences */}
      <div className="mb-6">
        <h3 className="text-lg font-extrabold text-black mb-3">
          Email Preferences
        </h3>

        {/* Email Recommendations */}
        <div className="flex justify-between items-center p-4 rounded-lg border border-gray-200">
          <div>
            <p className="font-semibold text-black">
              Recommendations & Reminders
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Keep this on to receive offer recommendations & timely reminders
              based on your interests
            </p>
          </div>
          <div
            onClick={() => handleToggle("email", "recommendations")}
            className={`relative inline-block w-12 h-6 rounded-full transition duration-300 ease-in-out cursor-pointer ${
              emailPreferences?.recommendations ? "bg-[#4BAF50]" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${
                emailPreferences?.recommendations
                  ? "transform translate-x-6"
                  : ""
              } bg-white`}
            ></span>
          </div>
        </div>

        {/* Email Newsletter */}
        <div className="flex justify-between items-center p-4 mt-4 rounded-lg border border-gray-200">
          <div>
            <p className="font-semibold text-black">Newsletter</p>
            <p className="text-sm text-gray-500 mt-1">
              Subscribe to the newsletter for promotions & offers
            </p>
          </div>
          <div
            onClick={() => handleToggle("email", "newsletter")}
            className={`relative inline-block w-12 h-6 rounded-full transition duration-300 ease-in-out cursor-pointer ${
              emailPreferences?.newsletter ? "bg-[#4BAF50]" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${
                emailPreferences?.newsletter ? "transform translate-x-6" : ""
              } bg-white`}
            ></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetting;
