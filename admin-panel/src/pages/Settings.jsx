import React, { useEffect, useState } from "react";
import { makeApiRequest, METHODS } from "../api/apiFunctions";
import { SETTINGS_ENDPOINT } from "../api/endpoints";
import useLoader from "../hooks/useLoader";
import PageLoader from "../loaders/PageLoader";
import { successType, toastMessage } from "../utils/toastMessage";
import { DEFAULT_ERROR_MESSAGE } from "../constant";
import { T } from "../utils/languageTranslator";
const Settings = () => {
  const { setPageLoader, pageLoader } = useLoader();
  const [settings, setSettings] = useState({
    low_stock: false,
    order_placed: false,
    alert_notification: false,
  });
  useEffect(() => {
    setPageLoader((prev) => true);
    makeApiRequest({
      endPoint: SETTINGS_ENDPOINT,
      method: METHODS?.get,
    })
      .then((res) => {
        const response = res?.data;
        const data = {
          low_stock: response?.low_stock,
          order_placed: response?.order_placed,
          alert_notification: response?.alert_notification,
        };
        setSettings(data);
      })
      .catch((err) => {
        console.log(err, "this is err");
      })
      .finally(() => {
        setPageLoader((prev) => false);
      });
  }, []);
  const updateSettings = (type) => {
    const payload = {
      ...settings,
      [type]: !settings?.[type],
    };
    setPageLoader((prev) => true);
    makeApiRequest({
      endPoint: SETTINGS_ENDPOINT,
      payload: payload,
      method: METHODS?.post,
    })
      .then((res) => {
        setSettings(payload);
        toastMessage(T["settings_changed_successfully"], successType);
      })
      .catch((err) => {
        console.log(err?.response?.data, "this is error");
        toastMessage(err?.response?.data || DEFAULT_ERROR_MESSAGE);
      })
      .finally(() => {
        setPageLoader((prev) => false);
      });
  };

  return (
    <>
      {pageLoader ? (
        <PageLoader />
      ) : (
        <div className="w-full">
          <div >
            <div className="flex gap-4 items-center p-4 rounded-lg">
              <div
                onClick={() => updateSettings("low_stock")}
                className={`relative inline-block w-12 h-6 rounded-full transition duration-300 ease-in-out cursor-pointer ${
                  settings.low_stock ? "bg-[#0A6259]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${
                    settings.low_stock ? "transform translate-x-6" : ""
                  } bg-white`}
                ></span>
              </div>
              <div>
                <p className="font-semibold text-black">{T["low_stock_alerts"]}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {T["allow_users_to_customize_alert_preferences"]}
                </p>
              </div>
            </div>
          </div>
          <div>
            <div className="flex gap-4 items-center p-4 rounded-lg">
              <div
                onClick={() => updateSettings("order_placed")}
                className={`relative inline-block w-12 h-6 rounded-full transition duration-300 ease-in-out cursor-pointer ${
                  settings.order_placed ? "bg-[#0A6259]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${
                    settings.order_placed ? "transform translate-x-6" : ""
                  } bg-white`}
                ></span>
              </div>
              <div>
                <p className="font-semibold text-black">{T["order_alerts"]}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {T["maintain_a_log_of_all_alerts_for_tracking_and_analysis"]}
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-center p-4 rounded-lg">
              <div
                onClick={() => updateSettings("alert_notification")}
                className={`relative inline-block w-12 h-6 rounded-full transition duration-300 ease-in-out cursor-pointer ${
                  settings.alert_notification ? "bg-[#0A6259]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${
                    settings.alert_notification ? "transform translate-x-6" : ""
                  } bg-white`}
                ></span>
              </div>
              <div>
                <p className="font-semibold text-black">
                  {T["alert_preferences_form"]}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {T["options_to_set_thresholds_for_low_stock_alerts_and_toggle_on_off_different_alert_types"]}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;
