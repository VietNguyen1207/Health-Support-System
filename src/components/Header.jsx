import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Dropdown, Menu, Button, Drawer } from "antd";
import {
  UserOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { dropdownMenu, menuItems } from "../constants/menuItems";
import { filterDropdownItemsByRole, filterMenuItemsByRole } from "../utils/Helper";

const Header = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(`/login`);
  };

  const handleMenuClick = (e) => {
    switch (e.key) {
      case "logout":
        handleLogout();
        break;
      case "dashboard":
        navigate(`${user?.role}`);
        break;
      default:
        navigate(e.key);
        break;
    }
  };

  const menuProps = {
    items: filterDropdownItemsByRole(dropdownMenu, user?.role),
    onClick: handleMenuClick,
  };

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const checkAuthUi = () => !user ? (
    <div className="flex gap-5">
      <Link
        to="/register"
        className="btn btn-outline"
        onClick={onClose}
      >
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
  )

  const navItems = useMemo(() => filterMenuItemsByRole(menuItems, user?.role), [user?.role])

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
          className="lg:hidden"
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={['']}
            items={navItems}
            style={{ flex: 1, minWidth: 0 }}
          />
          <div className="mt-4 flex justify-center items-center">
            {checkAuthUi()}
          </div>
        </Drawer>

        <nav className="hidden lg:flex gap-5 flex-1 justify-end items-center">
          <Menu mode="horizontal" selectedKeys={[location.pathname]} items={navItems} style={{ flex: 1, minWidth: 0, justifyContent: "end", borderBottom: 0 }} />

          <div className="nav-actions" id="authButtons">
            {checkAuthUi()}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
