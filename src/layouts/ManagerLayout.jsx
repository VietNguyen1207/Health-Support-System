import { useEffect, useState } from "react";
import {
  Button,
  ConfigProvider,
  Dropdown,
  Layout,
  Menu,
  theme,
  Avatar,
} from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  UserOutlined,
  PoweroffOutlined,
  CalendarOutlined,
  FileOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../stores/authStore";
import { useNotificationStore } from "../stores/notificationStore";
import NotificationBell from "../components/NotificationBell";

const { Header, Sider, Content, Footer } = Layout;

export const ManagerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG, colorPrimary },
  } = theme.useToken();
  const startPolling = useNotificationStore((state) => state.startPolling);
  const stopPolling = useNotificationStore((state) => state.stopPolling);
  const { getNotifications, clearNotifications } = useNotificationStore();

  useEffect(() => {
    const fetchData = async () => {
      if (user?.userId) await getNotifications(user?.userId);
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (user?.userId) {
      console.log("Starting polling...");
      startPolling(user.userId);

      return () => {
        console.log("Cleanup: stopping polling...");
        clearNotifications();
        stopPolling();
      };
    }
  }, [user]);

  const menuItems = [
    {
      key: "/manager/users",
      icon: <UserOutlined />,
      label: "User Management",
    },
    {
      key: "/manager/programs",
      icon: <CalendarOutlined />,
      label: "Program Management",
    },
    {
      key: "/manager/surveys",
      icon: <FileOutlined />,
      label: "Survey Management",
    },
    {
      key: "/manager/appointments",
      icon: <CalendarOutlined />,
      label: "Appointment Management",
    },
  ];

  const handleMenuClick = (e) => {
    // console.log(e);

    switch (e.key) {
      case "logout":
        handleLogout();
        break;
      default:
        navigate(e.key);
        break;
    }
  };

  const menuProps = {
    items: [
      {
        label: "Logout",
        key: "logout",
        icon: <PoweroffOutlined />,
        danger: true,
      },
    ],
    onClick: handleMenuClick,
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };
  const sideMenu = (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={(e) => handleMenuClick(e)}
      className="min-h-full w-full"
    />
  );

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemSelectedColor: "white",
            itemSelectedBg: colorPrimary,
            colorPrimary: colorPrimary,
          },
        },
      }}>
      <Layout className="h-screen">
        <Sider
          trigger={null}
          theme="light"
          collapsible
          collapsed={collapsed}
          breakpoint="lg"
          onBreakpoint={(broken) => {
            setCollapsed(broken);
          }}
          className="shadow-md overflow-auto"
          style={{
            background: colorBgContainer,
            borderRight: "1px solid #f0f0f0",
            position: "relative",
          }}>
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center">
              {!collapsed && (
                <span className="ml-2 font-semibold text-lg">CMS Manager</span>
              )}
            </div>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-600"
            />
          </div>
          <div className="p-3">
            {!collapsed && (
              <div className="mb-4 p-3 rounded-lg bg-gray-50 flex items-center">
                <Avatar
                  size="large"
                  icon={<UserOutlined />}
                  src={user?.avatar}
                />
                <div className="ml-3">
                  <div className="font-medium">{user?.fullName}</div>
                  <div className="text-xs text-gray-500">{user?.role}</div>
                </div>
              </div>
            )}
            {sideMenu}
          </div>
        </Sider>
        <Layout>
          <Header
            style={{
              padding: "0 16px",
              background: colorBgContainer,
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
              height: "64px",
              lineHeight: "64px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
            <div className="text-xl font-semibold">
              {menuItems.find((item) => item.key === location.pathname)
                ?.label || "Dashboard"}
            </div>
            <div className="flex items-center">
              <NotificationBell />
              <Dropdown
                menu={menuProps}
                placement="bottomRight"
                trigger={["click"]}>
                <Button type="text" className="flex items-center">
                  <Avatar
                    size="small"
                    icon={<UserOutlined />}
                    src={user?.avatar}
                    className="mr-2"
                  />
                  {user?.fullName}
                  <DownOutlined className="ml-1 text-xs" />
                </Button>
              </Dropdown>
            </div>
          </Header>
          <Content
            style={{
              margin: "16px",
              padding: "24px",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              overflow: "auto",
            }}>
            <Outlet />
          </Content>
          <Footer style={{ textAlign: "center", padding: "12px" }}>
            CMS Manager ©{new Date().getFullYear()} Created by Your Company
          </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};
