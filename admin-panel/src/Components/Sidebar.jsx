import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ConfigurationIcon,
  DashboardIcon,
  DiscountIcon,
  EmployeeIcon,
  InventoryIcon,
  OrdersIcon,
  PaymentIcon,
  ProductsIcon,
  RawMaterialsIcon,
  RecipeIcon,
  TodoIcon,
  SupportIcon,
  SettingsIcon,
  NotificationIcon,
  leftCaret,
  CategoryIcon,
} from "../assets/Icons/Svg";
import userImage from "../assets/images/Avatar.png";
import dummyUserImage from "../assets/images/dummy_user.png";

import { T } from "../utils/languageTranslator";
import { ROLES } from "../constant";
import { useProfile } from "../contexts/ProfileProvider";
import { createName, createPreview } from "../utils/helpers";

const SIDEBAR_LINKS_TOP = [
  {
    label: T["dashboard"],
    icon: DashboardIcon,
    href: "/dashboard",
    activeRoutes: ["/dashboard", "/"],
    roles: [ROLES?.admin],
  },
  {
    label: T["products"],
    icon: ProductsIcon,
    href: "/products",
    activeRoutes: ["/products", "/add-edit-product", "/view-product"],
    roles: [ROLES?.admin, ROLES?.stockManager, ROLES?.accountManager],
  },
  {
    label: T["categories"],
    icon: CategoryIcon,
    href: "/categories",
    activeRoutes: ["/categories"],
    roles: [ROLES?.admin, ROLES?.stockManager, ROLES?.accountManager],
  },
  {
    label: T["raw_materials"],
    icon: RawMaterialsIcon,
    href: "/raw-materials",
    activeRoutes: ["/raw-materials"],
    roles: [ROLES?.admin, ROLES?.stockManager, ROLES?.accountManager],
  },
  {
    label: T["orders"],
    icon: OrdersIcon,
    href: "/orders-management",
    activeRoutes: ["/orders-management", "/orders-history", "/single-order"],
    roles: [ROLES?.admin, ROLES?.accountManager],
  },
  {
    label: T["inventory"],
    icon: InventoryIcon,
    href: "/inventory",
    activeRoutes: ["/inventory"],
    roles: [ROLES?.admin, ROLES?.stockManager, ROLES?.accountManager],
  },
  {
    label: T["discounts_promotions"],
    icon: DiscountIcon,
    href: "/discounts",
    activeRoutes: ["/discounts", "/add-edit-discount"],
    roles: [ROLES?.admin],
  },
  {
    label: T["employee"],
    icon: EmployeeIcon,
    href: "/employee",
    activeRoutes: ["/employee"],
    roles: [ROLES?.admin],
  },
  {
    label: T["customers"],
    icon: DashboardIcon,
    href: "/customers",
    activeRoutes: ["/customers"],
    roles: [ROLES?.admin],
  },
  {
    label: T["todo"],
    icon: TodoIcon,
    href: "/to-do",
    activeRoutes: ["/to-do"],
    roles: [ROLES?.admin, ROLES?.stockManager, ROLES?.accountManager],
  },
  {
    label: T["zip_configuration"],
    icon: ConfigurationIcon,
    href: "/configuration",
    activeRoutes: ["/configuration"],
    roles: [ROLES?.admin],
  },
  {
    label: T["recipe_s"],
    icon: RecipeIcon,
    href: "/recipe",
    activeRoutes: ["/recipe", "/add-edit-recipe", "/add-edit-recipe/"],
    roles: [ROLES?.admin, ROLES?.stockManager],
  },
  {
    label: T["payment_history"],
    icon: PaymentIcon,
    href: "/payment-history",
    activeRoutes: ["/payment-history"],
    roles: [ROLES?.admin, ROLES?.accountManager],
  },
];
const SIDEBAR_LINKS_BOTTOM = [
  // {
  //   label: T["support"],
  //   icon: SupportIcon,
  //   href: "/support",
  // },
  {
    label: T["notifications"],
    icon: NotificationIcon,
    href: "/notifications",
  },
  {
    label: T["settings"],
    icon: SettingsIcon,
    href: "/settings",
  },
];

const Sidebar = () => {
  const { pathname } = useLocation();
  const { profile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const userName = localStorage.getItem("userName");
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  const filteredLinks = SIDEBAR_LINKS_TOP.filter((link) => {
    const currentUserRole = localStorage?.getItem("role");
    return link.roles.includes(currentUserRole);
  });
  const handleRouteActiveClass = (activeRoutes) => {
    if (pathname.startsWith("/recipe")) {
      // Check if the activeRoutes array contains the full pathname for recipe-related paths
      if (activeRoutes.some((route) => pathname === route)) {
        return "active-link";
      }
    } else {
      // For non-recipe routes, check for an exact match
      if (activeRoutes.includes(pathname)) {
        return "active-link";
      }
    }
    return ""; // Return an empty string if no match is found
  };
  // Close dropdown when clicking outside
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

  return (
    <>
      <nav className="sidebar w-20 bg-white shadow-lg h-screen fixed top-0 left-0 min-w-[280px] py-3 px-3 font-[sans-serif] overflow-auto flex flex-col justify-between">
        <div className="flex flex-col">
          <Link
            href="/dashboard"
            className="nav-item brand_logo p-5 text-2xl font-semibold"
          >
            LOGO
          </Link>
          <ul className="custom_nagivation max-h-[70vh] overflow-auto">
            {filteredLinks?.map(({ label, href, icon, activeRoutes }, idx) => (
              <li key={idx}>
                <NavLink
                  key={idx}
                  to={href}
                  className={`nav-item ${handleRouteActiveClass(activeRoutes)}`}
                >
                  <div className="nav-item">
                    <div className="icon">{icon}</div>
                    <span className="sidebar-label">{label}</span>
                  </div>
                </NavLink>
              </li>
            ))}
            <div className="horizontal-line w-full h-px bg-gray-300 my-4"></div>
            {SIDEBAR_LINKS_BOTTOM?.map(({ label, href, icon }, idx) => (
              <li>
                <NavLink
                  key={idx}
                  to={href}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "active-link" : ""}`
                  }
                >
                  <div className="nav-item">
                    <div className="icon">{icon}</div>
                    <span className="sidebar-label">{label}</span>
                  </div>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative block text-left">
          {/* Profile Button with Image and Name */}
          <button
            className="flex items-center w-full space-x-2 justify-between p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={toggleDropdown}
          >
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  src={
                    profile?.profile_picture
                      // ? createPreview(profile?.profile_picture)
                      ? profile?.profile_picture

                      : dummyUserImage
                  }
                />
              </div>
              {/* <span></span> */}
              <div className="text-left admin-info-sidebar">
                <h4 className="text-[12px] text-[#64748B]">{T["welcome_back"]} 👋</h4>
                <span className="font-semibold text-gray-700">
                  {profile?.first_name
                    ? createName(profile?.first_name, profile?.last_name)
                    : userName}
                </span>
              </div>
            </div>
            <span>{leftCaret}</span>
          </button>

          {isOpen && (
            <div
              id="dropdownMenu"
              ref={dropdownRef}
              className="absolute left-0 bottom-[70px] mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
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
                {T["settings"]}
              </span>
              <button
                onClick={handleLogout}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {T["logout"]}
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
