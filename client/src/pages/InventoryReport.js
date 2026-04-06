import React, { useEffect, useState } from "react";
import API from "../axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import '../style/report.css'
import { useRef } from "react";


const InventoryDashboard = () => {
  const [data, setData] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const [statusFilter, setStatusFilter] = useState(""); // "" = all statuses
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  const formatDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const toastTimeout = useRef(null);

const showToast = (message, type = "success") => {
  if (toastTimeout.current) {
    clearTimeout(toastTimeout.current);
  }

  setToast({ show: true, message, type });

  toastTimeout.current = setTimeout(() => {
    setToast({ show: false, message: "", type: "success" });
  }, 3000);
};


const formatDateTime = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};


  const [fromDate, setFromDate] = useState(formatDate(firstDay));
  const [toDate, setToDate] = useState(formatDate(today));

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [fromDate, toDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await API.get(
        `/inventoryEntries?fromDate=${fromDate}&toDate=${toDate}`
      );
      setData(res.data);
      console.log(res.data);
    } catch (err) {
      console.error(err);
      setData([]);
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = statusFilter
  ? data.filter((row) => row.status == statusFilter)
  : data;


  // ✅ Excel Export
  const exportToExcel = () => {
    const excelData = filteredData.map((row) => ({
      Voucher: row.TransferID,
      Product: row.ProductName,
      Weight: row.IssuedWt,
      Status: row.StatusName,
      CreatedDate: row.CreatedDate,
      CreatedBy: row.createdBy,
      Remarks: row.remarks,
      Reject_Remarks: row.rejectRemark,
      TranferedDate: row.transferedDate,
      Received_Rejected_Date: row.receivedDate,
      CompletedDate: row.completedDate
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "Inventory.xlsx");
  };

// const handleUpdateStatus = async (row, status) => {
//   try {
//     await API.post(`/updateStatus`, {
//       id: row.id,
//       status: status, // e.g., 'TRANSFER', 'COMPLETE', 'RECEIVE', 'REJECT'
//     });
//     loadData(); // refresh table
//   } catch (err) {
//     console.error(err);
//   }
// };

  const handleUpdateStatus = async (row, status) => {
    try {
      const res = await API.post(`/updateStatus`, {
        id: row.id,
        status: status,
      });

      showToast(res.data.message || "Status updated", "success");

      loadData();
    } catch (err) {
      console.error(err);

      if (err.response?.data?.message) {
        showToast(err.response.data.message, "error");
      } else {
        showToast("Something went wrong", "error");
      }
    }
  };


  return (
    <div className="container-fluid mt-4">


        {toast.show && (
                  <div className={`toast-box ${toast.type}`}>
                    {toast.message}
                  </div>
        )}

      {/* FILTER */}
      <div className="row mb-3">
       

        <div className="col-md-4 d-flex gap-2 align-items-center">
          <label>From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="form-control"
          />

          <label>To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="col-md-2 d-flex gap-2 align-items-center">
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {setStatusFilter(e.target.value); console.log(e.target.value)}}
            className="form-control"
          >
            <option value="">All</option>
            <option value="0">Issued</option>
            <option value="1">Transfered</option>
            <option value="2">Rejected</option>
            <option value="3">Received</option>
            <option value="4">Completed</option>
          </select>
        </div>

        <div className="col-md-3">
          <button className="btn btn-success" onClick={exportToExcel}>
            Export Excel
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div
        className="table-responsive"
        style={{ maxHeight: "650px", overflowY: "auto" }}
      >
        <table className="table table-bordered table-striped text-center">
          <thead>
            <tr>
              {[        
                "Image",        
                "Date",
                "Transfer ID",
                "Product",
                "Weight",
                "Status",
                "Transfered",
                "Received /  Reject",
                "Completed",
                "Remarks",
                "Reject Remark",
                "Action",
              ].map((h, i) => (
                <th
                  key={i}
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#666",
                    color: "#fff",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8">Loading...</td>
              </tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((row, i) => (
                <tr key={i}>
                  
                   <td>
                      {row.ProductImage ? (
                        <img
                          src={`data:image/jpeg;base64,${row.ProductImage}`}
                          alt="img"
                          width="30"
                          height="30"
                          style={{
                            objectFit: "cover",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            setSelectedImage(`data:image/jpeg;base64,${row.ProductImage}`)
                          }
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                  <td>
                    {new Date(row.CreatedDate).toLocaleDateString("en-GB")}
                  </td>
                  <td>{row.TransferID}</td>
                  <td>{row.ProductName}</td>
                  <td>{row.IssuedWt}</td>
                  <td>{row.StatusName || "-"}</td>
                  <td>
                     {row.transferedDate ? formatDateTime(row.transferedDate) : "-"}
                  </td>
                  <td>
                     {row.receivedDate ? formatDateTime(row.receivedDate) : "-"}
                  </td>
                  <td>
                     {row.completedDate ? formatDateTime(row.completedDate): "-"}
                  </td>
                  <td>{row.remarks ? row.remarks : "-"}</td>
                   <td>
                    {row.status == 2 ? row.rejectRemark : "-" }
                  </td>
                  <td>
                    {row.status == 0 && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleUpdateStatus(row, 'TRANSFER')}
                      >
                        Transfer
                      </button>
                    )}

                    {row.status == 1 && (
                      <span className="badge bg-warning px-lg-2 text-dark">
                        Waiting for Receive
                      </span>
                    )}

                    {row.status == 2 && (
                      <span className="badge px-lg-2 bg-danger">
                        Rejected
                      </span>
                    )}

                    {row.status == 3 && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleUpdateStatus(row, 'COMPLETE')}
                      >
                        Complete
                      </button>
                    )}

                    {row.status == 4 && (
                      <span className="badge bg-success px-lg-2">
                        Completed
                      </span>                      
                    )}
                  </td>


                  {/* ✅ IMAGE */}
                  {/* <td>
                      {row.ProductImage ? (
                        <img
                          src={`data:image/jpeg;base64,${row.ProductImage}`}
                          alt="img"
                          width="60"
                          height="60"
                          style={{
                            objectFit: "cover",
                            borderRadius: "6px",
                          }}
                        />
                      ) : (
                        "-"
                      )}
                    </td> */}

                   

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11">No Data Found</td>
              </tr>
            )}
          </tbody>
        </table>

{selectedImage && (
  <div
    className="modal fade show"
    style={{ display: "block", backgroundColor: "rgba(0,0,0,0.7)" }}
  >
    <div className="modal-dialog modal-dialog-centered modal-lg">
      <div className="modal-content">

        {/* HEADER */}
        <div className="modal-header">
          <h5 className="modal-title">Image Preview</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setSelectedImage(null)}
          ></button>
        </div>

        {/* BODY */}
        <div className="modal-body text-center">
          <img
            src={selectedImage}
            alt="preview"
            className="img-fluid rounded"
            style={{ maxHeight: "70vh", objectFit: "contain" }}
          />
        </div>

      </div>
    </div>
  </div>
)}

{selectedImage && (
  <div
    className="modal-backdrop fade show"
    onClick={() => setSelectedImage(null)}
  ></div>
)}

      </div>
    </div>
  );
};

export default InventoryDashboard;