import { Fragment, useState } from "react";
import "./App.css";
import Sidebar from "./Components/Sidebar";
import { Route, Routes } from "react-router-dom";
import PrivateLayout from "./Layouts/PrivateLayout";
import PublicLayout from "./Layouts/PublicLayout";
import { routes } from "./routing/routes";
import Dashboard from "./pages/Dashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'react-tooltip/dist/react-tooltip.css'

function App() {
  const getCurrentRole = () => {
    const currentUserRole = localStorage?.getItem("role");
    return currentUserRole;
  };
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        {routes?.map((curItem, idx) => (
          <Fragment key={idx}>
            {curItem.private ? (
              <Route element={<PrivateLayout curItem={curItem} />}>
                <Route path={curItem.path} element={curItem.element} />
              </Route>
            ) : curItem.public ? (
              <Route element={<PublicLayout />}>
                <Route path={curItem.path} element={curItem.element} />
              </Route>
            ) : (
              <Route path={curItem.path} element={curItem.element} />
            )}
          </Fragment>
        ))}
      </Routes>
    </>
  );
}

export default App;
