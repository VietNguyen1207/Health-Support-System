import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../style/Header.css";
import "../style/Footer.css";

export const StandardLayout = () => {
  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <div className="flex flex-col justify-end min-h-screen">
          <Header />
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer />
        </div>
      </Layout>
    </>
  );
};
