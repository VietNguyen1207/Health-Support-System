import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/Login.css";
import { useAuthStore } from "../stores/authStore";
import { message } from "antd";

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Gọi action login từ store
      await login(formData);
      // Chuyển hướng sau khi đăng nhập thành công
      navigate("/");
    } catch (error) {
      console.log(error);

      message.error("Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Sign In</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              type="text"
              id="email"
              name="email"
              className="form-input"
              placeholder="Enter your Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="remember-me">
            <input
              type="checkbox"
              id="remember"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
            />

            <label htmlFor="rememberMe">Remember me</label>
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>

        <div className="forgot-password">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
