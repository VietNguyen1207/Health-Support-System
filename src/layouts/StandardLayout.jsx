import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../style/Header.css";
import "../style/Footer.css";

export const StandardLayout = () => {
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
        <div className="main-wrapper">
          <Header />
          <div className="lg:mb-28 md:mb-72 mb-96 pb-32 min-h-screen">
            <Outlet />
          </div>
          <Footer />
        </div>
      </Layout>
    </>
  );
};
