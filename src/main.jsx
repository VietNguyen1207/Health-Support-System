import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider } from "antd";
import WrappedApp from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfigProvider>
      <WrappedApp />
    </ConfigProvider>
  </StrictMode>
);
