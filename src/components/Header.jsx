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

  const items = [
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

  const handleMenuClick = (e) => {
    switch (e.key) {
      case "test-record":
        navigate("/test-record");
        break;
      case "appointment-record":
        navigate("/appointment-record");
        break;
      case "logout":
        handleLogout();
        break;
      default:
        break;
    }
  };

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // const menuItems = [
  //   { key: "/", label: "Home", icon: <HomeOutlined /> },
  //   { key: "/contact", label: "Contact", icon: <ContactsOutlined /> },
  //   { key: "/services", label: "Services", icon: <CustomerServiceOutlined /> },
  //   { key: "/about", label: "About", icon: <InfoCircleOutlined /> },
  // ];

  // if (user) {
  //   menuItems.push({
  //     key: `/${user.role}`,
  //     label: "Dashboard",
  //     icon: <UserOutlined />,
  //   });
  // }

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
          aria-label="Toggle menu">
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
          {/* <Link
            to="/dashboard"
            className={`nav-link ${
              location.pathname === "/dashboard" ? "active" : ""
            }`}
            onClick={() => setIsMenuOpen(false)}>
            <span>Dashboard</span>
          </Link> */}
          <Link
            to="/contact"
            className={`nav-link ${
              location.pathname === "/contact" ? "active" : ""
            }`}
            onClick={() => setIsMenuOpen(false)}>
            <span>Contact</span>
          </Link>
          {!user ||
            (user.role !== "manager" && user.role !== "psychologist" && (
              <Link
                to="/book-appointment"
                className={`nav-link book-now ${
                  location.pathname === "/book-appointment" ? "active" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}>
                <span>Book Now</span>
              </Link>
            ))}
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
