import React, { useState } from "react";
import logo from "../assets/pos.png";
import "../style/login.css";

import API from "../axios";

import { useNavigate } from "react-router-dom";


function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  // const apiurl = 'http://localhost:8000'

//   async function handleLogin() {
//   try {

//     if(username == ''){        
//       setErrorMsg("Enter username");
//       return;
//     }
//     if(password == ''){
//       setErrorMsg("Enter password");
//       return;
//     }

//     const response = await API.post(`${apiurl}/api/login`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         username: username,
//         password: password,
//       }),
//     });

//     const data = await response.json();

//     if (data.status === "success") {
//       localStorage.setItem("user", JSON.stringify(data.data));
//       const branchcode = data.data.branchCode.trim();
//       localStorage.setItem("branch", branchcode);
//       // 🔀 redirect based on role
//       if (data.data.role === "1") {
//         // navigate("/admin");   // 👈 Admin page
        
//        navigate("/inventory");
//       } else {
//        navigate("/inventory");   // 👈 Inventory page
//       }

//     } else {
//       setErrorMsg("Invalid username or password");
//     }

//   } catch (error) {
//     console.error(error);
//     setErrorMsg("Technical issue");
//   }
// }

async function handleLogin() {
  try {
    if (username === "") {
      setErrorMsg("Enter username");
      return;
    }

    if (password === "") {
      setErrorMsg("Enter password");
      return;
    }

    const response = await API.post("/login", {
      username: username,
      password: password,
    });

    const data = response.data; // ✅ Axios uses .data

    if (data.status === "success") {
      localStorage.setItem("user", JSON.stringify(data.data));

      if (data.data.role === "1") {
        navigate("/ReceiverPage");
      } else {
        navigate("/UserPage");
      }
    }
     else {
      setErrorMsg("Invalid username or password");
    }

  } catch (error) {
    console.error(error);
    setErrorMsg("Invalid username or password");
  }
}

  return (
    <div className="loginmain d-flex justify-content-center align-items-center vh-100">
      <div
        className="box shadow p-lg-5 rounded-2 p-3"
        style={{ marginTop: "-100px" }}
      >
        <div className="logo d-flex justify-content-center">
          <img
            className="logo"
            src={logo}
            alt="Logo"
            style={{ height: "75px", objectFit: "contain" }}
          />
        </div>

        <div className="form d-flex flex-column gap-lg-3 my-lg-3 gap-3 my-3">
          <div className="form-group">
            <label className="fw-bold">Username</label>
            <input type="text" required className="form-control" onChange={(e) => setUsername(e.target.value)} />
          </div>

          {/* 🔐 Password with eye toggle */}
          <div className="form-group position-relative">
            <label className="fw-bold">Password</label>

            <input
              type={showPassword ? "text" : "password"}
              required
              className="form-control pe-5"
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Eye Icon */}
            <i
              className={`bi ${
                showPassword ? "bi-eye-slash" : "bi-eye"
              } position-absolute`}
              style={{
                right: "15px",
                top: "30px",
                cursor: "pointer",
                fontSize: "18px",
              }}
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          </div>
              {errorMsg && <div className="text-danger error fw-bold text-center">{errorMsg}</div>}
          <div className="form-group w-100 mt-lg-2 mt-2">
            <button className="btn btn-sm btn-warning fw-bold text-center w-100 p-2" onClick={handleLogin}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;