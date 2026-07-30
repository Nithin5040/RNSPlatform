import { Navigate } from "react-router-dom";

// Check authentication from sessionStorage
const isAuthenticated = () => {
  const user = sessionStorage.getItem("auth_user");
  return !!user;
};

// Get role ID - first from roleId key, fallback to parsing auth_user JSON
const getRoleId = () => {
  const storedRoleId = sessionStorage.getItem("roleId");
  if (storedRoleId) {
    const parsed = parseInt(storedRoleId, 10);
    if (!isNaN(parsed)) return parsed;
  }

  // Fallback: parse from auth_user JSON
  try {
    const authUser = sessionStorage.getItem("auth_user");
    if (authUser) {
      const user = JSON.parse(authUser);
      return Number(user.RoleId);
    }
  } catch (e) {
    console.error("ProtectedRoute - Failed to parse auth_user:", e);
  }

  return null;
};

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const authenticated = isAuthenticated();
  const roleId = getRoleId();

  console.log("ProtectedRoute - Check:", {
    authenticated,
    roleId,
    allowedRoles,
  });

  // Not logged in → go to login
  if (!authenticated) {
    console.log("ProtectedRoute - Not authenticated → /login");
    return <Navigate to="/login" replace />;
  }

  // Role-based access check
  if (allowedRoles.length > 0 && !allowedRoles.includes(roleId)) {
    console.log("ProtectedRoute - Role not allowed:", { roleId, allowedRoles });

    // Redirect to the correct dashboard based on actual role
    if (roleId === 1) {
      return <Navigate to="/admin_dashboard" replace />;
    } else if (roleId === 4) {
      return <Navigate to="/reporting_manager_dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  console.log("ProtectedRoute - Access granted for roleId:", roleId);
  return children;
}
