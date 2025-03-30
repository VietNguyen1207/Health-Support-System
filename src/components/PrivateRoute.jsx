import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuthStore } from "../stores/authStore";

export const PrivateRoute = ({
  children,
  allowedRoles = [],
  requiresGuest = false,
}) => {
  const { user } = useAuthStore();

  // Guest routes logic
  if (requiresGuest) {
    return user ? (
      <Navigate to={getRoleBasedPath(user.role)} replace />
    ) : (
      children
    );
  }

  // Protected routes logic
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Role-based access check
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Helper function to get redirect path based on role
const getRoleBasedPath = (role) => {
  const paths = {
    manager: "/manager/users",
    psychologist: "/psychologist-profile",
    student: "/student-profile",
    parent: "/parent-profile",
  };
  return paths[role] || "/";
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  requiresGuest: PropTypes.bool,
};
