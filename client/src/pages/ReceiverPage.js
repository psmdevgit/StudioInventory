// import React, { useState } from "react";
import EntriesReport from './EntriesReport';

const ReceiverPage = () => {
//   const [activeTab, setActiveTab] = useState("entry");

  return (
    <div className="">
      {/* Tabs */}
      {/* <div className="d-flex gap-2 mb-2">
        <button
          className={`btn ${
            activeTab === "entry" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setActiveTab("entry")}
        >
          Entry
        </button>

        <button
          className={`btn ${
            activeTab === "report" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setActiveTab("report")}
        >
          Report
        </button>
      </div> */}

      {/* Content */}
      <div>
        {/* {activeTab === "entry" && <Entry />} */}
        {/* {activeTab === "report" && <InventoryReport />} */}

        <EntriesReport />

      </div>
    </div>
  );
};

export default ReceiverPage;