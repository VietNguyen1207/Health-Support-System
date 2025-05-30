import { BrowserRouter, useRoutes } from "react-router-dom";
import { ConfigProvider } from "antd";
import { routes } from "./routes/AppRoutes";
import "./App.css";
import ScrollToTop from "./components/ScrollToTop";
import { useEffect } from "react";
import { useAuthStore } from "./stores/authStore";

function App() {
  const element = useRoutes(routes);
  const { checkAndClearInvalidAuth } = useAuthStore();

  // Check token validity when app loads
  useEffect(() => {
    checkAndClearInvalidAuth();
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#4a7c59", // or whatever your custom-green color value is
        },
        components: {
          Notification: {
            colorPrimary: "#4a7c59",
            marginXL: 50,
          },
          Calendar: {
            itemActiveBg: "#e8f5e9",
          },
          Tag: {
            margin: 0,
            paddingContentHorizontal: 0,
            paddingContentVertical: 0,
          },
          Tabs: {
            itemSelectedColor: "#007824",
            cardBg: "#f0f0f0",
          },
          Button: {
            colorPrimary: "#4a7c59",
            colorPrimaryHover: "#3a6349",
            colorPrimaryActive: "#2d4d39",
          },
          Layout: {},
        },
      }}
    >
      <ScrollToTop />
      {element}
    </ConfigProvider>
  );
}

function WrappedApp() {
  return (
    <BrowserRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <App />
    </BrowserRouter>
  );
}

export default WrappedApp;
