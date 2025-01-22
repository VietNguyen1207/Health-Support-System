import { useState } from "react";
import { Layout, Menu, theme } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { HomeOutlined, UserOutlined, FileOutlined } from "@ant-design/icons";
import { useAuthStore } from "../stores/authStore";

const { Header, Sider, Content } = Layout;

export const ManagerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, setUser } = useAuthStore();
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
    navigate(key);
  };

  const handleLogout = () => {
    setUser(null);
    navigate("/login");
  };

  const sideMenu = (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={({ key }) => handleMenuClick(key)}
      className="min-h-full pt-4"
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
        <div style={{ marginRight: 16, color: "white" }}>
          <span style={{ marginRight: 16 }}>{user?.name}</span>
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
          style={{
            display: { xs: "none", lg: "block" },
          }}>
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
