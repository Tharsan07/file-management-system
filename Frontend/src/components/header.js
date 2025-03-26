import React from "react";
import logo from "../assets/logo.png"; // Adjust path as needed
import certs from "../assets/iso-certify-trans.png"; // Adjust path as needed

export default function Header() {
  return (
    <>
      <style>{`
        .header-wrapper {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: linear-gradient(to right, #e0eafc, #cfdef3);
          border-bottom: 2px solid #2563eb;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
        }

        .header-logo {
          height: 80px;
          object-fit: contain;
        }

        .header-certs {
          height: 60px;
          object-fit: contain;
        }
      `}</style>

      <div className="header-wrapper">
        <div className="header-content">
          <img src={logo} alt="Company Logo" className="header-logo" />
          <img src={certs} alt="Certifications" className="header-certs" />
        </div>
      </div>
    </>
  );
}
