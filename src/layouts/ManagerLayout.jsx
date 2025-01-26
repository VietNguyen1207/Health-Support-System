import { useState } from "react";
import { Dropdown, Layout, Menu, theme } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  UserOutlined,
  FileOutlined,
  SwapOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../stores/authStore";

const { Header, Sider, Content } = Layout;

export const ManagerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: "/manager",
      icon: <HomeOutlined />,
      label: "Dashboard",
    },
    {
      key: "/manager/users",
      icon: <UserOutlined />,
      label: "User Management",
    },
    {
      key: "/manager/surveys",
      icon: <FileOutlined />,
      label: "Survey Management",
    },
  ];

  const handleMenuClick = (key) => {
    // console.log(key);

    switch (key.key) {
      case "home":
        navigate("/");
        break;
      case "logout":
        handleLogout();
        break;
      default:
        break;
    }
  };

  const menuProps = {
    items: [
      {
        label: "Home",
        key: "home",
        icon: <SwapOutlined />,
      },
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
    navigate("/login");
  };
  const sideMenu = (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={({ key }) => handleMenuClick(key)}
      className="min-h-full w-max pt-4"
    />
  );

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Header
        style={{
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "end",
        }}>
        <div style={{ marginRight: 16 }}>
          <Dropdown.Button menu={menuProps}>
            <UserOutlined /> {user.name}
          </Dropdown.Button>
        </div>
      </Header>
      <Layout>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          breakpoint="lg"
          onBreakpoint={(broken) => {
            setCollapsed(broken);
          }}
          className="w-fit">
          {sideMenu}
        </Sider>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: "auto",
            height: "calc(100vh - 110px)",
          }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
