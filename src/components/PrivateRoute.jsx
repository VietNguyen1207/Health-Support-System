import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuthStore } from "../stores/authStore";

export const PrivateRoute = ({
  children,
  allowedRoles = [],
  requiresGuest = false,
}) => {
  const { user } = useAuthStore();

  if (requiresGuest) {
    if (user) {
      return <Navigate to="/" replace />;
    }
    return children;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/404" replace />;
  }

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  requiresGuest: PropTypes.bool,
};
