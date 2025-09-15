import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";
import AddEditProduct from "../pages/AddEditProduct";
import Categories from "../pages/Categories";
import RawMaterials from "../pages/RawMaterials";
import Todo from "../pages/Todo";
import ZipConfiguration from "../pages/ZipConfiguration";
import RecipeAddEdit from "../pages/RecipeAddEdit";
import Recipe from "../pages/Recipe";
import InventoryManagement from "../pages/InventoryManagement";
import EmployeeManagement from "../pages/EmployeeManagement";
import PaymentHistory from "../pages/PaymentHistory";
import Discounts from "../pages/Discounts";
import AddEditDiscount from "../pages/AddEditDiscount";
import Customers from "../pages/Customers";
import Support from "../pages/Support";
import Notifications from "../pages/Notifications";
import Settings from "../pages/Settings";
import ForgetPassword from "../pages/ForgetPassword";
import OrdersHistory from "../Components/OrderHistory";
import OrderManagement from "../Components/OrderManagement";
import { ROLES } from "../constant";
import SingleOrder from "../pages/SingleOrder";
import ViewProduct from "../pages/ViewProduct";
import ProfilePage from "../pages/ProfilePage";

export const routes = [
  {
    path: "/",
    element: <Dashboard />,
    private: true,
    roles: [ROLES?.admin, ROLES?.bakery],
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    private: true,
    roles: [ROLES?.admin, ROLES?.bakery],
  },
  {
    path: "/products",
    element: <Products />,
    private: true,
    roles: [
      ROLES?.admin,
      ROLES?.bakery,
      ROLES?.stockManager,
      ROLES?.accountManager,
    ],
  },
  {
    path: "/login",
    element: <Login />,
    public: true,
    roles: [ROLES?.admin, ROLES?.bakery],
  },
  {
    path: "/add-edit-product",
    element: <AddEditProduct />,
    private: true,
    roles: [
      ROLES?.admin,
      ROLES?.bakery,
      ROLES?.stockManager,
      ROLES?.accountManager,
    ],
  },
  {
    path: "/view-product",
    // element: <AddEditProduct />,
    element: <ViewProduct />,
    private: true,
    roles: [ROLES?.admin, ROLES?.bakery, ROLES?.stockManager],
  },

  {
    path: "/categories",
    element: <Categories />,
    private: true,
    roles: [ROLES?.admin, ROLES?.bakery],
  },

  {
    path: "/raw-materials",
    element: <RawMaterials />,
    private: true,
    roles: [
      ROLES?.admin,
      ROLES?.bakery,
      ROLES?.stockManager,
      ROLES?.accountManager,
    ],
  },
  {
    path: "/to-do",
    element: <Todo />,
    private: true,
    roles: [
      ROLES?.admin,
      ROLES?.bakery,
      ROLES?.stockManager,
      ROLES?.accountManager,
    ],
  },
  {
    path: "/recipe",
    element: <Recipe />,
    private: true,
    roles: [ROLES?.admin, ROLES?.bakery, ROLES?.stockManager],
  },
  {
    path: "/configuration",
    element: <ZipConfiguration />,
    private: true,
    roles: [ROLES?.admin, ROLES?.bakery],
  },
  {
    path: "/add-edit-recipe",
    element: <RecipeAddEdit />,
    private: true,
    roles: [ROLES?.admin, ROLES?.bakery, ROLES?.stockManager],
  },
  // {
  //   path: "/add-edit-recipe/:receipe_id",
  //   element: <RecipeAddEdit />,
  //   private: true,
  //   roles: [ROLES?.admin, ROLES?.bakery, ROLES?.stockManager],
  // },
  {
    path: "/inventory/",
    element: <InventoryManagement />,
    private: true,
    roles: [
      ROLES?.admin,
      ROLES?.bakery,
      ROLES?.stockManager,
      ROLES?.accountManager,
    ],
  },
  {
    path: "/employee/",
    element: <EmployeeManagement />,
    private: true,
    roles: [ROLES?.admin, ROLES?.bakery],
  },

  {
    path: "/payment-history/",
    element: <PaymentHistory />,
    private: true,
    roles: [ROLES?.admin, ROLES?.bakery, ROLES?.accountManager],
  },
  {
    path: "/customers",
    element: <Customers />,
    private: true,
    roles: [ROLES?.admin, ROLES?.bakery],
  },

  {
    path: "/support",
    element: <Support />,
    private: true,
    roles: [ROLES?.admin, ROLES?.bakery],
  },
  {
    path: "/notifications",
    element: <Notifications />,
    private: true,
    roles: [...Object.values(ROLES).filter((rl) => rl !== ROLES?.worker)],
  },
  {
    path: "/*",
    element: <NotFound />,
    roles: [...Object.values(ROLES)?.map((rl) => rl)],
  },
  {
    path: "/discounts/",
    element: <Discounts />,
    private: true,
    roles: [ROLES?.admin, ROLES?.bakery],
  },
  {
    path: "/add-edit-discount/",
    element: <AddEditDiscount />,
    private: true,
    roles: [ROLES?.admin, ROLES?.bakery],
  },
  {
    path: "/settings",
    element: <Settings />,
    private: true,
    roles: [...Object.values(ROLES).filter((rl) => rl !== ROLES?.worker)],
  },
  // {

  //   path: "/support",
  //   element: <Support />,
  //   private: true,
  //   roles: [ROLES?.admin, ROLES?.bakery],
  // },
  {
    path: "/forget-password",
    element: <ForgetPassword />,
    public: true,
    roles: [ROLES?.admin, ROLES?.bakery],
  },
  {
    path: "/orders-history",
    element: <OrdersHistory />,
    private: true,
    roles: [ROLES?.admin, ROLES?.bakery, ROLES?.accountManager],
  },
  {
    path: "/orders-management",
    element: <OrderManagement />,
    private: true,
    roles: [ROLES?.admin, ROLES?.bakery, ROLES?.accountManager],
  },
  {
    path: "/single-order",
    element: <SingleOrder />,
    private: true,
    roles: [ROLES?.admin, ROLES?.bakery, ROLES?.stockManager],
  },
  {
    path: "/profile",
    element: <ProfilePage />,
    private: true,
    roles: [...Object.values(ROLES).filter((rl) => rl !== ROLES?.worker)],
  },
];
