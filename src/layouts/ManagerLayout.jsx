import { useEffect, useState } from "react";
import { Button, ConfigProvider, Dropdown, Layout, Menu, theme } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  UserOutlined,
  FileOutlined,
  SwapOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../stores/authStore";
import { useNotificationStore } from "../stores/notificationStore";

const { Header, Sider, Content } = Layout;

export const ManagerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { borderRadiusLG },
  } = theme.useToken();
  const startPolling = useNotificationStore((state) => state.startPolling);
  const stopPolling = useNotificationStore((state) => state.stopPolling);
  const { getNotifications } = useNotificationStore();

  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (user?.userId) await getNotifications(user?.userId);
  //   };
  //   fetchData();
  // }, []);

  // useEffect(() => {
  //   if (user?.userId) {
  //     console.log("Starting polling...");
  //     startPolling(user.userId);

  //     return () => {
  //       console.log("Cleanup: stopping polling...");
  //       stopPolling();
  //     };
  //   }
  // }, [user]);

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
    // {
    //   key: "/manager/surveys",
    //   icon: <FileOutlined />,
    //   label: "Survey Management",
    // },
    {
      key: "/manager/applications",
      icon: <FileOutlined />,
      label: "Application Management",
    },
  ];

  const handleMenuClick = (e) => {
    // console.log(e);

    switch (e.key) {
      case "home":
        navigate("/");
        break;
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
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={(e) => handleMenuClick(e)}
      className="min-h-full w-max"
    />
  );

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            // itemSelectedBg: "#CBECD5",
            itemSelectedColor: "white",
            itemSelectedBg: "#1677ff",
            colorPrimary: "#1677ff",
          },
        },
      }}>
      <Layout style={{ height: "100vh", overflow: "hidden" }}>
        <Header
          style={{
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
          }}>
          <Dropdown.Button
            menu={menuProps}
            align="end"
            buttonsRender={([, rightButton]) => [
              <Button
                key={user?.role}
                icon={<UserOutlined />}
                className={`flex items-center gap-2 px-3 py-1 rounded-l-md border w-full pointer-events-none`}>
                {user.fullName}
              </Button>,
              rightButton,
            ]}
            trigger={"click"}
            style={{ flex: 0, marginRight: 16 }}
          />
        </Header>
        <Layout className="bg-white">
          <Sider
            trigger={null}
            theme="dark"
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
              margin: "10px 16px",
              padding: 30,
              paddingLeft: 50,
              paddingRight: 20,
              background: "white",
              borderRadius: borderRadiusLG,
              overflow: "auto",
              height: "90%",
            }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};
