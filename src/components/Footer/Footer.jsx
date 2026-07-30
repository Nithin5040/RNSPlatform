import React from "react";
import "./Footer.css";

export default function Footer({ darkMode = false, theme = '' }) {
  const isDark = darkMode || theme === 'dark';
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  return (
    <div className={`critical-footer ${isDark ? 'dark' : ''}`}>
      <div className="critical-footer-content">
        <span className="copyright">
          © Vishvin {currentYear}-{nextYear}
        </span>
        <span className="company-name">
          Vishvin Technologies Pvt Limited
        </span>
        <span className="rights">
          All rights reserved
        </span>
      </div>
    </div>
  );
}


