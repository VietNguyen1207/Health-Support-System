import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuthStore } from "../stores/authStore";
// import Home from "../pages/Home";

export const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  // Kiểm tra đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra quyền (nếu có)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};
