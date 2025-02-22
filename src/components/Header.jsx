import { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Dropdown, Menu, ConfigProvider } from "antd";
import { CalendarFilled, UserOutlined } from "@ant-design/icons";
import { dropdownMenu, menuItems } from "../constants/menuItems";
import {
  checkRole,
  filterDropdownItemsByRole,
  filterMenuItemsByRole,
} from "../utils/Helper";
import NotificationBell from "./NotificationBell";

const Header = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

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

  const checkAuthUI = () =>
    !user ? (
      <div className="flex gap-5">
        <Link to="/register" className="btn btn-outline">
          Sign Up
        </Link>
        <Link to="/login" className="btn btn-primary">
          Sign In
        </Link>
      </div>
    ) : (
      <Dropdown.Button menu={menuProps} align="end">
        <UserOutlined /> {user.name}
      </Dropdown.Button>
    );

  const navItems = useMemo(() => {
    const filteredItems = filterMenuItemsByRole(menuItems, user?.role).filter(
      (item) => !item.special
    );
    const specialItem = filterMenuItemsByRole(menuItems, user?.role).find(
      (item) => item.special
    );

    return {
      filteredItems,
      specialItem,
    };
  }, [user?.role]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            // Menu item styles
            horizontalItemSelectedColor: "#4a7c59",
            horizontalItemHoverColor: "#4a7c59",
            itemHoverColor: "#4a7c59",
            itemSelectedColor: "#4a7c59",
            itemHoverBg: "rgba(74, 124, 89, 0.1)",
            itemSelectedBg: "rgba(74, 124, 89, 0.1)",
            activeBarBorderWidth: 2,
            activeBarHeight: 2,
            horizontalItemBorderRadius: 0,
            activeBarColor: "#4a7c59",

            // Submenu styles
            subMenuItemBg: "#ffffff",
            itemActiveBg: "rgba(74, 124, 89, 0.1)",
            horizontalLineHeight: "46px",
            itemMarginInline: 0,
            itemBorderRadius: 0,
            popupBg: "#ffffff",
            subMenuItemColor: "#4a7c59",
            groupTitleColor: "#4a7c59",
            horizontalLineType: "solid",
            activeBarWidth: 2,
            subMenuTitleColor: "#4a7c59",
          },
        },
      }}>
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <Link to="/">
              <span className="logo-icon">🧠</span>
              <span className="logo-text">Mental Health Support</span>
            </Link>
          </div>

          <nav className="flex gap-5 flex-1 justify-end items-center">
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={navItems.filteredItems}
              style={{
                flex: 1,
                minWidth: 0,
                justifyContent: "end",
                borderBottom: 0,
              }}
            />

            {navItems.specialItem && (
              <>
                <Link to={navItems.specialItem.key} className="">
                  <div className="bg-primary rounded-full px-4 py-2">
                    <span className="text-sm font-semibold text-white hover:text-white">
                      {navItems.specialItem.label}
                    </span>
                  </div>
                </Link>
              </>
            )}

            <div className="flex item-center gap-3">
              {user && !checkRole(user.role, "psychologist") && (
                <span className="h-full flex items-center justify-center">
                  <div
                    className={`rounded-full border-[10px] text-[12px] flex justify-center items-center cursor-pointer 
                    transition-all duration-300`}
                    onClick={() => {
                      navigate("/calendar");
                    }}>
                    <CalendarFilled className="text-lg" />
                  </div>
                </span>
              )}
              {user && <NotificationBell />}
            </div>

            <div className="nav-actions" id="authButtons">
              {checkAuthUI()}
            </div>
          </nav>
        </div>
      </header>

      <style>
        {`
          .ant-menu-submenu-selected .ant-menu-title-content {
            color: #4a7c59 !important;
          }
        `}
      </style>
    </ConfigProvider>
  );
};

export default Header;
