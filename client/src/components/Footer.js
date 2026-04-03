import React from "react";
import logo from "../assets/pos.png"; 

function Footer() {
  return (
    <footer className=" text-light pt-4 mt-5" style={{background:'#740A08'}}>
      <div className="container">

        <div className="row">

          {/* 🏢 Company Info */}
          <div className="col-md-4 mb-3">

    <div className="d-flex align-items-center">
         <img
                src={logo}
                alt="Logo"
                style={{ height: "50px", objectFit: "contain" }}
            />

            <h5 className="fw-bold me-3">Pothys Swarna Mahal</h5>
    </div>

           
            <p className="small">
              Your trusted jewellery destination. Quality gold, diamond and silver collections with best price.
            </p>
          </div>

          {/* 🔗 Quick Links */}
          <div className="col-md-4 mb-3">
            {/* <h6 className="fw-semibold">Quick Links</h6> */}
            <ul className="list-unstyled">
              <li><a href="#" className="text-light text-decoration-none">Home</a></li>
              <li><a href="#" className="text-light text-decoration-none">Products</a></li>
              <li><a href="#" className="text-light text-decoration-none">Billing</a></li>
              <li><a href="#" className="text-light text-decoration-none">Reports</a></li>
            </ul>
          </div>

          {/* 📞 Contact */}
          <div className="col-md-4 mb-3">
            <h6 className="fw-semibold">Contact</h6>
            <p className="small mb-1">
              📍 Chennai, Tamil Nadu
            </p>
            <p className="small mb-1">
              📞 +91 98765 43210
            </p>
            <p className="small">
              ✉️ support@pothys.com
            </p>
          </div>

        </div>

        <hr className="border-light" />

        {/* 🔽 Bottom row */}
        <div className="d-flex justify-content-between align-items-center pb-3">

          <span className="small">
            © {new Date().getFullYear()} Pothys Swarna Mahal. All rights reserved.
          </span>

          {/* 🌐 Social Icons */}
          <div className="d-flex gap-3">
            <i className="bi bi-facebook"></i>
            <i className="bi bi-instagram"></i>
            <i className="bi bi-twitter-x"></i>
          </div>

        </div>

      </div>
    </footer>
  );
}

export default Footer;
