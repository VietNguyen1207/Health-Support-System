import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../style/Header.css";
import "../style/Footer.css";

// const { Header, Content } = Layout;

export const StandardLayout = () => {
  //   const { user, setUser } = useAuthStore();
  //   const navigate = useNavigate();
  //   const {
  //     token: { colorBgContainer, borderRadiusLG },
  //   } = theme.useToken();

  //   const handleLogout = () => {
  //     setUser(null);
  //     navigate("/login");
  //   };

  //   const menuItems = [
  //     { key: "/", label: "Home", icon: <HomeOutlined /> },
  //     { key: "/contact", label: "Contact", icon: <ContactsOutlined /> },
  //   ];

  //   if (user) {
  //     menuItems.push({
  //       key: `/${user.role}`,
  //       label: "Dashboard",
  //       icon: <UserOutlined />,
  //     });
  //   }

  return (
    <>
      {/* <Header
        style={{
          background: "#2f7a39",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{ color: "white", fontSize: "18px", marginRight: "24px" }}>
            School Portal
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ background: "#2f7a39" }}
          />
        </div>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ color: "white" }}>
              <UserOutlined style={{ marginRight: 8 }} />
              {user.name}
            </span>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ color: "white" }}>
              Logout
            </Button>
          </div>
        )}
      </Header> */}
      <Layout style={{ minHeight: "100vh" }}>
        <Header />
        <Outlet />
        <Footer />
      </Layout>
    </>
  );
};
