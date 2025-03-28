import "../style/Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Button, Form, Input, Checkbox, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useEffect } from "react";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, checkAndClearInvalidAuth } = useAuthStore();
  const [form] = Form.useForm();

  useEffect(() => {
    checkAndClearInvalidAuth();
  }, []);

  const handleSubmit = async (values) => {
    try {
      form.setFields([]);

      const user = await login(values);

      message.success("Login successful!");

      switch (user.role) {
        case "student":
          navigate("/student-profile");
          break;
        case "psychologist":
          navigate("/psychologist-profile");
          break;
        case "parent":
          navigate("/parent-profile");
          break;
        case "manager":
          navigate("/manager");
          break;
        default:
          navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.status === 401) {
        message.error("Invalid email or password");
      } else if (error.response?.status === 403) {
        message.error("Account is locked or inactive");
      } else {
        message.error("Login failed. Please try again");
      }

      form.setFieldsValue({ password: "" });
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Sign In</h2>

        <Form
          form={form}
          onFinish={handleSubmit}
          initialValues={{ remember: false }}
          layout="vertical"
          className="login-form"
        >
          <Form.Item
            label="Email"
            name="loginIdentifier"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input
              size="large"
              placeholder="Enter your Email"
              prefix={<UserOutlined className="text-gray-400" />}
              className="login-input"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              size="large"
              placeholder="Enter your password"
              prefix={<LockOutlined className="text-gray-400" />}
              className="login-input"
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox className="remember-checkbox">Remember me</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              className="login-button"
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div className="forgot-password">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
