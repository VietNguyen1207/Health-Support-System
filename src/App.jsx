import { BrowserRouter, useRoutes } from "react-router-dom";
import { ConfigProvider } from "antd";
import { routes } from "./routes/AppRoutes";
import "./App.css";

function App() {
  const element = useRoutes(routes);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#2f7a39",
        },
      }}>
      {element}
    </ConfigProvider>
  );
}

function WrappedApp() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default WrappedApp;
