
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const MainLayout = () => {

  return (
    <div>

      <div
      >
        <Navbar />

        <div className="p-3">
          <Outlet />
        </div>
      </div>

    </div>
  );
};

export default MainLayout;