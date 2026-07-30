import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Settings, LogOut, ChevronDown, Menu, X, Sun, Moon } from "lucide-react";
import logo from "../../assets/Logo.png";
import vishvinLogo from "../../assets/Vishvin.png";
import axiosClient from "../../api/axiosClient";
import { SummaryApi } from "../../api/SummaryApi";
import Swal from 'sweetalert2';
import "./Header.css";

export default function Header({ toggleTheme, theme, toggleSidebar, sidebarOpen, showMobileMenu }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const menuButtonRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadUser = () => {
      if (isLoggingOut) return;

      const storedUser = sessionStorage.getItem("auth_user");
      const storedUserRole = sessionStorage.getItem("userRole");
      const storedUserName = sessionStorage.getItem("userName");

      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser({
            ...userData,
            name: storedUserName || userData.name || (userData.FirstName + ' ' + userData.LastName).trim() || 'User',
            role: storedUserRole || userData.role || userData.RoleName || 'User',
            email: sessionStorage.getItem("userEmail") || userData.email || userData.Email || ''
          });
          setLoggedIn(true);
        } catch (error) {
          console.error("Error parsing user data:", error);
          setUser(null);
          setLoggedIn(false);
        }
      } else {
        setUser(null);
        setLoggedIn(false);
      }
    };

    loadUser();
    window.addEventListener("auth", loadUser);
    window.addEventListener("storage", loadUser);

    const handleClickOutside = (event) => {
      if (
        menuOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("auth", loadUser);
      window.removeEventListener("storage", loadUser);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen, isLoggingOut]);



  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You will be logged out of your account",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, logout'
      });

      if (!result.isConfirmed) {
        setIsLoggingOut(false);
        return;
      }

      Swal.fire({
        title: 'Logging out...',
        text: 'Please wait',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });



      sessionStorage.clear();
      setUser(null);
      setLoggedIn(false);
      setMenuOpen(false);
      Swal.close();

      await Swal.fire({
        icon: 'success',
        title: 'Logged Out Successfully',
        text: 'Redirecting to login...',
        timer: 1000,
        showConfirmButton: false,
        willClose: () => {
          navigate("/login", { replace: true });
        }
      });

    } catch (error) {
      console.error("Error during logout:", error);
      sessionStorage.clear();
      setUser(null);
      setLoggedIn(false);
      setMenuOpen(false);
      Swal.close();
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserDisplayName = () => {
    if (!user || isLoggingOut) return "User";
    if (user.name) return user.name;
    if (user.FirstName && user.LastName) return `${user.FirstName} ${user.LastName}`.trim();
    if (user.FirstName) return user.FirstName;
    if (user.email) return user.email.split('@')[0];
    return "User";
  };

  const getUserRole = () => {
    if (!user || isLoggingOut) return "User";
    if (user.role) return user.role;
    if (user.RoleName) return user.RoleName;
    return "User";
  };

  const getUserEmail = () => {
    if (!user || isLoggingOut) return "";
    if (user.email) return user.email;
    if (user.Email) return user.Email;
    return "";
  };

  const getUserInitials = () => {
    if (!user || isLoggingOut) return "U";
    const name = getUserDisplayName();
    if (name && name !== "User") {
      return name.charAt(0).toUpperCase();
    }
    return "U";
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).toUpperCase();
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <header className={`app-header ${theme}`}>
      <div className="header-container">
        <div className="header-content">
          {/* Logo Section */}
          <a
            href="https://www.vishvin.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="header-logo"
            style={{
              height: '60px',
              width: 'auto',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <div className="logo-brand-image">
              <img
                src={vishvinLogo}
                alt="Vishvin Technologies Pvt Limited"
                style={{
                  height: '56px',
                  width: 'auto',
                  objectFit: 'contain',
                  transform: 'scale(2.0)',
                  transformOrigin: 'left center',
                  filter: 'brightness(0) invert(1)'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </a>

          {/* Center Section - System Title */}
          <div className="header-title-container">
            <h1 className="header-system-title">
              <span className="full-title">Resilient Network Architecture</span>

            </h1>
          </div>

          {/* Right Section - All controls aligned to right */}
          <div className="header-controls">
            {/* Theme Toggle Button */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className="theme-toggle-btn"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}



            {/* Auth Section and Mobile Menu */}
            <div className="auth-and-menu">
              {showMobileMenu && (
                <button
                  onClick={toggleSidebar}
                  className="header-mobile-menu-btn"
                  aria-label={sidebarOpen ? "Close menu" : "Open menu"}
                >
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              )}

              {loggedIn && !isLoggingOut ? (
                <div className="user-dropdown">
                  <button
                    ref={menuButtonRef}
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="user-button"
                  >
                    <div className="user-avatar">
                      {getUserInitials()}
                    </div>
                    <div className="user-info">
                      <span className="user-name">{getUserDisplayName()}</span>
                      <span className="user-role">{getUserRole()}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`dropdown-arrow ${menuOpen ? 'open' : ''}`}
                    />
                  </button>

                  {menuOpen && (
                    <div ref={dropdownRef} className="dropdown-menu">
                      <div className="dropdown-header">
                        <div className="dropdown-user">
                          <div className="dropdown-avatar">
                            {getUserInitials()}
                          </div>
                          <div className="dropdown-user-info">
                            <p className="dropdown-user-name">{getUserDisplayName()}</p>
                            <p className="dropdown-user-role">{getUserRole()}</p>
                            <p className="dropdown-user-email">{getUserEmail()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="dropdown-items">
                        <Link
                          to="/admin_dashboard"
                          className="dropdown-item"
                          onClick={() => setMenuOpen(false)}
                        >
                          <User size={16} />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to="/change-password"
                          className="dropdown-item"
                          onClick={() => setMenuOpen(false)}
                        >
                          <Settings size={16} />
                          <span>Change Password</span>
                        </Link>
                      </div>

                      <div className="dropdown-divider"></div>

                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="dropdown-item logout-item"
                      >
                        <LogOut size={16} />
                        <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
