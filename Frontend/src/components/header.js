import React from "react";
import logo from "../assets/logo.png"; // Adjust path as needed
import certs from "../assets/iso-certify-trans.png"; // Adjust path as needed

export default function Header() {
  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-100 to-blue-200 border-b-2 border-blue-600 shadow-md">
      <div className="flex justify-between items-center px-5 py-3">
        <img src={logo} alt="Company Logo" className="h-20 object-contain" />
        <img src={certs} alt="Certifications" className="h-16 object-contain" />
      </div>
    </div>
  );
}
