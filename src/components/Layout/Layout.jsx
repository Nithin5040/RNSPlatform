import React, { useState, useEffect, useCallback } from "react";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import Footer from "../Footer/Footer";
import { FaBars, FaTimes } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import "./Layout.css";

export default function Layout({ children, showSidebar = true }) {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [roleId, setRoleId] = useState(null); // Changed from userRole to roleId
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (mobile) {
        setSidebarOpen(false);
      } else {
        const savedCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
        setSidebarCollapsed(savedCollapsed);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Handle click outside on mobile
  useEffect(() => {
    if (!isMobile || !sidebarOpen) return;

    const handleClickOutside = (e) => {
      const sidebar = document.querySelector(".sidebar");
      const menuButton = document.querySelector(".mobile-menu-button");
      
      if (sidebar && !sidebar.contains(e.target) && menuButton && !menuButton.contains(e.target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, sidebarOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [sidebarOpen]);

  // Check authentication - Only check if user is logged in, not their role
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = sessionStorage.getItem("auth_user");
      const storedRoleId = sessionStorage.getItem("roleId");
      
      setIsLoggedIn(!!storedUser);
      
      if (storedRoleId) {
        setRoleId(parseInt(storedRoleId));
        console.log("Layout - RoleId from storage:", storedRoleId);
      } else {
        setRoleId(null);
      }
    };

    checkAuth();
    window.addEventListener("auth", checkAuth);
    window.addEventListener("storage", checkAuth);
    
    return () => {
      window.removeEventListener("auth", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  // Simplified sidebar visibility - only check if user is logged in and showSidebar prop is true
  // The Sidebar component will handle its own visibility based on roleId
  const shouldShowSidebar = useCallback(() => {
    const shouldShow = showSidebar && isLoggedIn;
    console.log("Layout - Should show sidebar container:", shouldShow, "isLoggedIn:", isLoggedIn);
    return shouldShow;
  }, [showSidebar, isLoggedIn]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);
  
  const toggleSidebarCollapse = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    localStorage.setItem("sidebarCollapsed", newCollapsed);
  };

  const showSidebarValue = shouldShowSidebar();
  const sidebarWidth = !showSidebarValue ? 0 : (sidebarCollapsed ? 80 : 260);

  return (
    <div className={`layout ${theme}`}>
      {/* Header - Fixed at top with theme toggle and sidebar toggle */}
      <Header 
        toggleTheme={toggleTheme} 
        theme={theme} 
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        showMobileMenu={showSidebarValue}
      />

      {/* Main Content Area with Sidebar */}
      <div className="layout-main">
        {/* Desktop Sidebar - Only render the container if user is logged in */}
        {showSidebarValue && !isMobile && (
          <div 
            className="sidebar-desktop"
            style={{ width: sidebarWidth }}
          >
            <Sidebar 
              isOpen={sidebarOpen}
              onClose={closeSidebar}
              // REMOVED: userRole={userRole}
              isMobile={isMobile}
              collapsed={sidebarCollapsed}
              onToggleCollapse={toggleSidebarCollapse}
              theme={theme}
            />
          </div>
        )}

        {/* Mobile Sidebar */}
        {showSidebarValue && isMobile && (
          <>
            {sidebarOpen && (
              <div className="sidebar-overlay" onClick={closeSidebar} />
            )}
            <div className={`sidebar-mobile ${sidebarOpen ? 'open' : ''}`}>
              <Sidebar 
                isOpen={sidebarOpen}
                onClose={closeSidebar}
                // REMOVED: userRole={userRole}
                isMobile={isMobile}
                collapsed={false}
                onToggleCollapse={toggleSidebarCollapse}
                theme={theme}
              />
            </div>
          </>
        )}

        {/* Content Area - Takes remaining space */}
        <div className="content-area">
          {/* Scrollable Content */}
          <main className="content-scrollable">
            <div className="content-wrapper">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Footer - Full Width across layout (taking sidebar space too) */}
      <Footer theme={theme} />
    </div>
  );
}
