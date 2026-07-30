import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Building2,
  BarChart3,
  UserPlus,
  Shield,
  ClipboardList,
  Home,
  FileCheck,
  Stethoscope,
  ShieldCheck,
  Key,
  Wrench,
  DoorOpen,
  Clock,
  Calendar,
  TrendingUp,
  FileBarChart,
  UserCheck,
  LogIn,
  UserX,
  PlusCircle,
  Eye,
  List,
  ChevronDown,
  ChevronUp,
  Phone,
  PhoneCall,
  MessageSquare,
  Target,
  Filter,
  Bell,
  PieChart,
  History,
  Menu,
  X,
  Activity,
  MapPin,
  UserCog,
  Globe,
  GitBranch,
  Layers,
  MapPinned,
  Network,
  FolderTree,
  Share2,
  LogOut as ExitIcon,
  UserMinus,
  RotateCcw,
  Fingerprint,
  Route,
  CheckCircle2
} from "lucide-react";
import { FaChartLine } from "react-icons/fa";
import axiosClient from "../../api/axiosClient";
import { SummaryApi } from "../../api/SummaryApi";
import Swal from 'sweetalert2';
import "./Sidebar.css";
import { FaExchangeAlt } from "react-icons/fa";

export default function Sidebar({
  isOpen,
  onClose,
  collapsed,
  onToggleCollapse,
  isMobile,
  theme
}) {
  const [user, setUser] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [activePath, setActivePath] = useState("");
  const [openAdminSubmenu, setOpenAdminSubmenu] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("auth_user");
    const storedRoleId = sessionStorage.getItem("roleId");

    console.log("Stored roleId:", storedRoleId); // Debug log

    if (storedRoleId) {
      setRoleId(parseInt(storedRoleId));
    }

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user:", error);
        setUser(null);
      }
    }
    setActivePath(window.location.pathname);
  }, []);



  // Handle logout with complete payload
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
      Swal.close();

      await Swal.fire({
        icon: 'success',
        title: 'Logged Out Successfully',
        text: 'Redirecting to login...',
        timer: 2000,
        showConfirmButton: false
      });

      window.location.href = "/login";

    } catch (error) {
      console.error("Error during logout:", error);
      sessionStorage.clear();
      Swal.close();
      window.location.href = "/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavigation = (path) => {
    window.location.href = path;
    if (isMobile && onClose) {
      onClose();
    }
  };

  const toggleSubmenu = (key) => {
    setOpenAdminSubmenu(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Admin specific menu items (for roleId = 1)
  const adminMenu = [
    {
      path: "/admin_dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />
    },
    {
      path: "/user-creation",
      label: "User Creation",
      icon: <PlusCircle size={20} />
    },
    {
      path: "/route-creation",
      label: "Route Plan",
      icon: <MapPin size={20} />
    },
    {
      path: "/master-route-upload",
      label: "Route Access",
      icon: <FileText size={20} />
    },
    {
      path: "/driver-creation",
      label: "Driver Creation",
      icon: <UserPlus size={20} />
    },
    {
      path: "/assign-route",
      label: "Assign Route",
      icon: <Route size={20} />
    },
    // {
    //   path: "/route-monitoring",
    //   label: "Route Monitoring",
    //   icon: <UserPlus size={20} />
    // },
    // {
    //   path: "/total-routes",
    //   label: "Total Routes",
    //   icon: <UserPlus size={20} />
    // },
    {
      path: "/completed-routes",
      label: "Completed Routes",
      icon: <CheckCircle2 size={20} />
    },
    {
      path: "/driver-profile",
      label: "Driver Details",
      icon: <User size={20} />
    },

  ];

  // RM specific menu items (for roleId = 4)
  const rmMenu = [
    {
      path: "/reporting_manager_dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />
    }
  ];

  // Common menu items (visible for all roles)
  const commonItems = [];

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "U";
    const name = user.name || user.FirstName || "User";
    return name.charAt(0).toUpperCase();
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "User";
    if (user.name) return user.name;
    if (user.FirstName && user.LastName) return `${user.FirstName} ${user.LastName}`;
    if (user.FirstName) return user.FirstName;
    return "User";
  };

  // Render menu item with hover effects
  const renderMenuItem = (item, index) => {
    const isActive = activePath === item.path;
    const isHovered = hoveredItem === item.path;

    return (
      <button
        key={item.path || index}
        onClick={() => handleNavigation(item.path)}
        onMouseEnter={() => setHoveredItem(item.path)}
        onMouseLeave={() => setHoveredItem(null)}
        className={`sidebar-nav-item ${isActive ? 'active' : ''} ${collapsed && !isMobile ? 'collapsed' : ''} ${isHovered ? 'hovered' : ''}`}
        title={collapsed && !isMobile ? item.label : ''}
      >
        <span className="nav-icon">{item.icon}</span>
        {(!collapsed || isMobile) && (
          <>
            <span className="nav-label">{item.label}</span>
            {isActive && <span className="nav-indicator" />}
          </>
        )}
        {isHovered && !collapsed && (
          <span className="nav-hover-effect" />
        )}
      </button>
    );
  };

  // Render submenu
  const renderSubMenu = (menu, level = 0) => {
    const isOpen = openAdminSubmenu[menu.key] || false;
    const hasActiveChild = menu.children?.some(child => {
      return activePath === child.path;
    });

    const showFull = !collapsed || isMobile;

    return (
      <div key={menu.key} className={`sidebar-submenu-container level-${level}`}>
        <button
          onClick={() => toggleSubmenu(menu.key)}
          onMouseEnter={() => setHoveredItem(menu.key)}
          onMouseLeave={() => setHoveredItem(null)}
          className={`sidebar-nav-item ${hasActiveChild || isOpen ? 'active' : ''} ${collapsed && !isMobile ? 'collapsed' : ''}`}
          title={collapsed && !isMobile ? menu.label : ''}
        >
          <span className="nav-icon">{menu.icon}</span>
          {showFull && (
            <>
              <span className="nav-label">{menu.label}</span>
              <span className="submenu-arrow">
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </>
          )}
        </button>

        {showFull && isOpen && (
          <div className={`sidebar-submenu level-${level}`}>
            {menu.children.map((child) => {
              const isChildActive = activePath === child.path;
              return (
                <button
                  key={child.key}
                  onClick={() => handleNavigation(child.path)}
                  onMouseEnter={() => setHoveredItem(child.key)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`sidebar-submenu-item ${isChildActive ? 'active' : ''}`}
                  style={{ paddingLeft: `${16 + (level + 1) * 12}px` }}
                >
                  {child.icon && <span className="submenu-icon">{child.icon}</span>}
                  <span className="submenu-label">{child.label}</span>
                  {isChildActive && <span className="submenu-indicator" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Close button for mobile
  const renderMobileCloseButton = () => {
    if (!isMobile) return null;

    return (
      <button
        className="sidebar-mobile-close"
        onClick={onClose}
        aria-label="Close sidebar"
      >
        <X size={20} />
      </button>
    );
  };

  // Don't render sidebar if roleId is not 1 (Admin) or 4 (Reporting Manager)
  if (roleId !== 1 && roleId !== 4) {
    console.log("Sidebar not shown because roleId is:", roleId);
    return null;
  }

  console.log("Rendering sidebar for roleId:", roleId);
  const menuToRender = roleId === 1 ? adminMenu : rmMenu;

  return (
    <aside className={`sidebar ${collapsed && !isMobile ? 'sidebar-collapsed' : ''} ${isMobile ? 'sidebar-mobile-view' : ''} ${theme}`}>
      {/* Mobile Close Button */}
      {renderMobileCloseButton()}

      {/* User Profile Section - Show on mobile */}
      {isMobile && user && (
        <div className="sidebar-profile">
          <div className="profile-content">
            <div className="profile-avatar">
              {getUserInitials()}
            </div>
            <div className="profile-info">
              <p className="profile-name">{getUserDisplayName()}</p>
              <p className="profile-role">{roleId === 1 ? "Admin" : "Reporting Manager"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {menuToRender.map((menu) => {
          if (menu.children) {
            return renderSubMenu(menu, 0);
          } else {
            return renderMenuItem(menu);
          }
        })}
        {commonItems.map((item, index) => renderMenuItem(item, index))}
      </nav>

      {/* Sidebar Footer with Logout and Expand/Collapse */}
      <div className="sidebar-footer">
        {/* Expand/Collapse Button - Desktop only */}
        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            className={`sidebar-footer-btn expand-collapse-btn ${collapsed ? 'collapsed' : ''}`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}

        {/* Logout Button */}
        {/* <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`sidebar-footer-btn logout-btn ${collapsed && !isMobile ? 'collapsed' : ''}`}
          title={collapsed && !isMobile ? "Logout" : ""}
        >
          <LogOut size={18} />
          {(!collapsed || isMobile) && <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>}
        </button> */}
      </div>
    </aside>
  );
}