import React, { useState } from "react";
import Entry from "./Entry";
import InventoryReport from "./InventoryReport";
import "../App.css"

const UserPage = () => {
  const [activeTab, setActiveTab] = useState("entry");

  return (
    <div className="">
      {/* Tabs */}
      <div className="d-flex gap-2 mb-2">
        <button
          className={`btn px-lg-5 ${
            activeTab === "entry" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setActiveTab("entry")}
        >
          Entry
        </button>

        <button
          className={`btn px-lg-5 ${
            activeTab === "report" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setActiveTab("report")}
        >
          Report
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === "entry" && <Entry />}
        {activeTab === "report" && <InventoryReport />}
      </div>
    </div>
  );
};

export default UserPage;