import React, { useEffect, useRef, useState } from "react";
import { activeBellIcon, BellIcon } from "../assets/Icons/Svg";
import dummyUserImage from "../assets/images/dummy_user.png";
import { T } from "../utils/languageTranslator";

import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  createName,
  createPreview,
  getGreeting,
  getHeadingTitleFromRoute,
  getHeadingTitleFromState,
  removeUnreadNotification
} from "../utils/helpers";
import { NOTIFICATION_UPDATE_ENDPOINT, SOCKET_ENDPOINT } from "../api/endpoints";
import { baseURL } from "../api/apiConfig";
import { useProfile } from "../contexts/ProfileProvider";
import { makeApiRequest, METHODS } from "../api/apiFunctions";

const Header = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();

  const dropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const params = useParams();
  const userName = localStorage.getItem("userName");
  const { pathname, state } = useLocation();
  const title = getHeadingTitleFromRoute(pathname);
  const socket = useRef(null);
  // State to track dropdown visibility
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState(false);
  const [greeting, setGreeting] = useState("");

  // const [notificationData, setNotificationData] = useState(DUMMY_NOTIFICATION_ICON_DATA);
  const [notificationData, setNotificationData] = useState([]);
  const [realTimeNotification, setRealTimeNotification] = useState();
  console.log(state, "this is state");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setNotification(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {

    socket.current = new WebSocket(`wss://bakery-api.rexett.com/ws/notifications/${localStorage.getItem("user_id")}/`);
    socket.current.onopen = () => {
      console.log("WebSocket connection established.");
    };
    socket.current.onmessage = (event) => {
      const newNotification = JSON.parse(event.data);
      console.log(newNotification?.notifications, "socket notification");
      setRealTimeNotification(removeUnreadNotification(newNotification?.notifications));
    };

    socket.current.onclose = () => {
      console.log("Websocket connection is closed");
    };

    return () => {
      socket.current?.close();
    };
  }, []);

  // useEffect(() => {
  //   if (realTimeNotification) {
  //     const temp = [...realTimeNotification]
  //     setNotificationData((prevNotifications) => [
  //       realTimeNotification,
  //       ...prevNotifications,
  //     ]);
  //   }
  // }, [realTimeNotification]);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };
  const handleLogout = () => {
    // make api call here
    // makeApiRequest({
    //   endPoint:LOGOUT_ENDPOINT
    // })
    localStorage.clear();
    navigate("/login");
  };
  console.log(notificationData, "this is notification data")
  const notificationToggleDropdown = () => {
    setNotification((prev) => !prev);
  };
  const handleNotificationClick = (nt) => {
    console.log(nt, "single notification");
    const { meta_data } = nt;
    updateNotificationStatus(nt?.id);
    if (meta_data?.product_id) {
      navigate("/view-product", {
        state: { id: meta_data?.product_id, isViewOnly: true },
      });
    } else if (meta_data?.order_id) {
      navigate("/single-order", { state: { id: meta_data?.order_id } });
    } else {
      navigate("/notifications");
    }
    setNotification(false);
    // add logic for redirection here
  };
  const updateNotificationStatus = (notificationId) => {
    makeApiRequest({
      endPoint: NOTIFICATION_UPDATE_ENDPOINT,
      method: METHODS.patch,
      update_id: notificationId,
      payload: {
        is_read: true,
        notification_id: notificationId
      }
    }).then((res) => {
    }).catch((err) => {
      console.log(err, "notification update error");
    })
  };

  console.log(realTimeNotification, "this is real time notification")
  return (
    <>
      <header className="header flex py-4 px-4 sm:px-10 font-[sans-serif] min-h-[70px] tracking-wide relative z-50 sticky top-0">
        <div className="flex flex-wrap items-center justify-between gap-5 w-full">
          <div className="main_head_title">
            {pathname === "/dashboard" || pathname === "/" ? (
              <h5 className="text-lg font-normal">
                {/* Good Morning{" "} */}
                {/* {T["welcome"]} */}
                {T[greeting]}
                <span className="text-[#EC7F1A] font-bold text-xl ml-2">
                  {profile?.first_name
                    ? createName(profile?.first_name, profile?.last_name)
                    : userName}
                </span>
              </h5>
            ) : (
              <h2 className="text-lg ">
                {pathname === "/add-edit-recipe/" && state?.recipe_id
                  ? "Edit Recipe"
                  : params?.receipe_id
                    ? "Edit Recipe"
                    : pathname === "/add-edit-discount"
                      ? getHeadingTitleFromState(state?.type)
                      : title}
              </h2>
            )}
          </div>

          <div className="flex max-lg:ml-auto space-x-3 relative">
            <button className="" onClick={notificationToggleDropdown}>
              {realTimeNotification?.length ? activeBellIcon : BellIcon}
            </button>
            {notification && (
              <div
                id="dropdownMenu"
                ref={notificationDropdownRef}
                className="absolute -left-5 top-10 mt-2 w-60 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
              >
                {realTimeNotification?.length > 0 ? (
                  <>
                    {realTimeNotification.slice(0, 5).map((item, index) => (
                      <div
                        key={index}
                        onClick={() => handleNotificationClick(item)}
                        className="cursor-pointer notify-wrapper block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="notify-title">
                          {item.title}
                        </div>
                        <div className="notify-description">
                          {item?.message}
                        </div>
                      </div>
                    ))}
                    {realTimeNotification.length > 5 && (
                      <div
                        onClick={() => {
                          navigate("/notifications");
                          setNotification(false);
                          setNotificationData([]);
                        }}
                        className="block view-all-notify px-4 py-2 text-sm text-blue-600 hover:underline cursor-pointer"
                      >
                        {T["view_all_notification"]}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="block px-4 py-2 text-sm text-gray-700">
                    No notifications yet.
                  </div>
                )}
              </div>
            )}

            {/* Profile Button with Image and Name */}
            <button
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              // onClick={toggleDropdown}
              onClick={() => {
                navigate("/profile");
                setIsOpen(false);
              }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={
                      profile?.profile_picture
                        ? createPreview(profile?.profile_picture)
                        // ? profile?.profile_picture
                        : dummyUserImage
                    }
                  />
                </div>
                <span className="font-semibold text-gray-700">
                  {profile?.first_name
                    ? createName(profile?.first_name, profile?.last_name)
                    : userName}
                </span>
              </div>
            </button>

            {isOpen && (
              <div
                id="dropdownMenu"
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
              >
                {/* <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Profile
                  </a> */}
                <span
                  onClick={() => {
                    navigate("/settings");
                    setIsOpen(false);
                  }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Settings
                </span>
                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <button id="toggleOpen" className="lg:hidden">
            <svg
              className="w-7 h-7"
              fill="#000"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path>
            </svg>
          </button>
        </div>
      </header>
    </>
  );
};

export default Header;
