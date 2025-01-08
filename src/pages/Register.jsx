import { useState } from "react";
import "../style/Register.css";

export default function Register() {
  // Add state management
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    userType: "student",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your registration logic here
    console.log(formData);
  };

  return (
    <div className="register-container ">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            type="text"
            name="username"
            className="form-control"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">User Type</label>
          <select
            className="form-control"
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            required
          >
            <option value="student">Student</option>
            <option value="parent">Parent</option>
          </select>
        </div>
        <button type="submit" className="register-btn">
          Register
        </button>
      </form>
    </div>
  );
}
