import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Dropdown } from "antd";
import {
  UserOutlined,
  // HomeOutlined,
  // ContactsOutlined,
  // CustomerServiceOutlined,
  // InfoCircleOutlined,
  SwapOutlined,
  PoweroffOutlined,
  FileDoneOutlined,
  HistoryOutlined,
} from "@ant-design/icons";

const Header = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  let menuItems = [];

  const studentMenu = [
    {
      label: "Test Record",
      key: "test-record",
      icon: <FileDoneOutlined />,
    },
    {
      label: "Appointment Record",
      key: "appointment-record",
      icon: <HistoryOutlined />,
    },
    {
      label: "Logout",
      key: "logout",
      icon: <PoweroffOutlined />,
      danger: true,
    },
  ];

  const parentMenu = [
    {
      label: "Children Record",
      key: "children-record",
      icon: <UserOutlined />,
    },
    {
      label: "Logout",
      key: "logout",
      icon: <PoweroffOutlined />,
      danger: true,
    },
  ];

  const psyMenu = [
    {
      label: "Patient Record",
      key: "patient-record",
      icon: <UserOutlined />,
    },
    {
      label: "Logout",
      key: "logout",
      icon: <PoweroffOutlined />,
      danger: true,
    },
  ];

  const managerMenu = [
    {
      label: "Dashboard",
      key: "dashboard",
      icon: <SwapOutlined />,
    },
    {
      label: "Logout",
      key: "logout",
      icon: <PoweroffOutlined />,
      danger: true,
    },
  ];

  if (user) {
    switch (user.role) {
      case "student":
        menuItems = studentMenu;
        break;
      case "parent":
        menuItems = parentMenu;
        break;
      case "psychologist":
        menuItems = psyMenu;
        break;
      case "manager":
        menuItems = managerMenu;
        break;
    }
  }

  const handleMenuClick = (e) => {
    switch (e.key) {
      case "test-record":
        navigate("/test-record");
        break;
      case "appointment-record":
        navigate("/appointment-record");
        break;
      case "patient-record":
        navigate("/patient-record");
        break;
      case "children-record":
        navigate("/children-record");
        break;
      case "dashboard":
        navigate(`/${user?.role}/dashboard`);
        break;
      case "logout":
        handleLogout();
        break;
      default:
        break;
    }
  };

  const menuProps = {
    items: menuItems,
    onClick: handleMenuClick,
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <span className="logo-icon">🧠</span>
            <span className="logo-text">Mental Health Support</span>
          </Link>
        </div>
        {/*  <button
          className="mobile-menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="hamburger-icon"></span>
        </button> */}

        <nav className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
            onClick={() => setIsMenuOpen(false)}>
            <span>Home</span>
          </Link>
          <Link
            to="/about"
            className={`nav-link ${
              location.pathname === "/about" ? "active" : ""
            }`}
            onClick={() => setIsMenuOpen(false)}>
            <span>About</span>
          </Link>
          <Link
            to="/services"
            className={`nav-link ${
              location.pathname === "/services" ? "active" : ""
            }`}
            onClick={() => setIsMenuOpen(false)}>
            <span>Services</span>
          </Link>
          <Link
            to="/contact"
            className={`nav-link ${
              location.pathname === "/contact" ? "active" : ""
            }`}
            onClick={() => setIsMenuOpen(false)}>
            <span>Contact</span>
          </Link>

          {user && user.role !== "parent" && (
            <>
              <Link
                to="/test"
                className={`nav-link ${
                  location.pathname === "/test" ? "active" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}>
                <span>Test</span>
              </Link>
            </>
          )}

          {!user ||
          (user.role !== "manager" && user.role !== "psychologist") ? (
            <Link
              to="/book-appointment"
              className={`nav-link book-now ${
                location.pathname === "/book-appointment" ? "active" : ""
              }`}
              onClick={() => setIsMenuOpen(false)}>
              <span>Book Now</span>
            </Link>
          ) : (
            user.role === "psychologist" && (
              <>
                <Link
                  to="/appointment"
                  className={`nav-link book-now ${
                    location.pathname === "/appointment" ? "active" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}>
                  <span>Appointment</span>
                </Link>
              </>
            )
          )}

          <div className="nav-actions" id="authButtons">
            {!user ? (
              <>
                <Link to="/register" className="btn btn-outline">
                  Sign Up
                </Link>
                <Link to="/login" className="btn btn-primary">
                  Sign In
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Dropdown.Button menu={menuProps}>
                  <UserOutlined /> {user.name}
                </Dropdown.Button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
