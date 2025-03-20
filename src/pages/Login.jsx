import "../style/Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Button, Form, Input, Checkbox, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      const user = await login(values);
      // console.log(user);
      message.success("Login successful!");
      // Navigate based on user role
      if (user.role === "student") {
        navigate("/student-profile");
      } else if (user.role === "psychologist") {
        navigate("/psychologist-profile");
      } else if (user.role === "parent") {
        navigate("/parent-profile");
      } else if (user.role === "manager") {
        navigate("/manager");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      message.error("Login failed");
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
          className="login-form">
          <Form.Item
            label="Email"
            name="loginIdentifier"
            rules={[{ required: true, message: "Please input your email!" }]}>
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
            rules={[
              { required: true, message: "Please input your password!" },
            ]}>
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
              className="login-button">
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
