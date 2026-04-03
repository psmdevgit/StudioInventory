import React from "react";
import logo from "../assets/pos.png";
import { useNavigate } from 'react-router-dom';
import '../App.css'
import { useEffect } from "react";

function Navbar() {

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user?.empName || "";

  function handlelogout() {      
    localStorage.clear();
    navigate("/")
  }

  useEffect(() => {
    if(!userName){
      navigate("/")
    }
  },[user])

  return (
    <nav className="navbar navbar-expand-lg navbar-white bg-whit shadow" style={{
      // background:'#2B7CD3'      
        background:"#9FCB98",
        position: "sticky",
        top: 0,
        zIndex: 1050
        // background:"#0F2470"
      }}>
      <div className="container-fluid d-flex row">

         <div className=" col-md-4 d-flex align-items-center justify-content-start ms-lg-3 col-4" >
          <i className="bi bi-person-circle userlogo me-lg-2 text-dark"></i>
          <span className="fw-semibold text-black username">{userName ? userName : "User"}</span>
        </div>


        <div className="col-md-4  d-flex align-items-center justify-content-center col-4">
          <img src={logo} className="navlogo"></img>
        </div>

        <div className="col-md-4  d-flex align-items-center justify-content-end col-4">
          {/* <span className="fw-semibold text-black me-lg-3 logout" onClick={()=> navigate("/")}>Logout</span> */}
          <i class="bi bi-box-arrow-right me-lg-3 logout" onClick={()=> handlelogout()}></i>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;