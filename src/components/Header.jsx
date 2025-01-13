import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Dropdown, Menu, Button, Drawer } from "antd";
import {
  UserOutlined,
  MenuOutlined,
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
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [visible, setVisible] = useState(false);
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

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const mobileMenu = (
    <Menu mode="vertical">
      <Menu.Item key="home">
        <Link to="/" onClick={onClose}>
          Home
        </Link>
      </Menu.Item>
      <Menu.Item key="about">
        <Link to="/about" onClick={onClose}>
          About
        </Link>
      </Menu.Item>
      <Menu.Item key="services">
        <Link to="/services" onClick={onClose}>
          Services
        </Link>
      </Menu.Item>
      <Menu.Item key="contact">
        <Link to="/contact" onClick={onClose}>
          Contact
        </Link>
      </Menu.Item>
      {user && user.role !== "parent" && (
        <Menu.Item key="test">
          <Link to="/test" onClick={onClose}>
            Test
          </Link>
        </Menu.Item>
      )}
      {(!user || (user.role !== "manager" && user.role !== "psychologist")) && (
        <Menu.Item key="book">
          <Link to="/book-appointment" onClick={onClose}>
            Book Now
          </Link>
        </Menu.Item>
      )}
      {user?.role === "psychologist" && (
        <Menu.Item key="appointment">
          <Link to="/appointment" onClick={onClose}>
            Appointment
          </Link>
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <span className="logo-icon">🧠</span>
            <span className="logo-text">Mental Health Support</span>
          </Link>
        </div>

        <Button
          // className="mobile-menu-button lg:hidden"
          className="lg:hidden"
          type="text"
          icon={<MenuOutlined />}
          onClick={showDrawer}
        />

        <Drawer
          title="Menu"
          placement="right"
          onClose={onClose}
          open={visible}
          className="lg:hidden">
          {mobileMenu}
          <div className="mt-4 flex justify-center items-center">
            {!user ? (
              <div className="flex flex-col gap-2">
                <Link
                  to="/register"
                  className="btn btn-outline"
                  onClick={onClose}>
                  Sign Up
                </Link>
                <Link to="/login" className="btn btn-primary" onClick={onClose}>
                  Sign In
                </Link>
              </div>
            ) : (
              <Dropdown.Button menu={menuProps} align="end">
                <UserOutlined /> {user.name}
              </Dropdown.Button>
            )}
          </div>
        </Drawer>

        <nav className="hidden lg:flex justify-between items-center gap-10">
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
            <span>Home</span>
          </Link>
          <Link
            to="/about"
            className={`nav-link ${
              location.pathname === "/about" ? "active" : ""
            }`}>
            <span>About</span>
          </Link>
          <Link
            to="/services"
            className={`nav-link ${
              location.pathname === "/services" ? "active" : ""
            }`}>
            <span>Services</span>
          </Link>
          <Link
            to="/contact"
            className={`nav-link ${
              location.pathname === "/contact" ? "active" : ""
            }`}>
            <span>Contact</span>
          </Link>

          {user && user.role !== "parent" && (
            <>
              <Link
                to="/test"
                className={`nav-link ${
                  location.pathname === "/test" ? "active" : ""
                }`}>
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
              }`}>
              <span>Book Now</span>
            </Link>
          ) : (
            user.role === "psychologist" && (
              <>
                <Link
                  to="/appointment"
                  className={`nav-link book-now ${
                    location.pathname === "/appointment" ? "active" : ""
                  }`}>
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
