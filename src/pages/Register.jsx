import { useState } from "react";
import "../style/Register.css";

export default function Register() {
  // Add state management
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    rePassword: "",
    dateOfBirth: "",
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
      <div className="register-box">
        <h2 className="register-title">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="fullname"
              className="form-control"
              value={formData.fullname}
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
            <label className="form-label">Date of Birth</label>
            <input
              type="datetime-local"
              name="date-of-birth"
              className="form-control"
              value={formData.password}
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
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="re-password"
              className="form-control"
              value={formData.rePassword}
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
              required>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
            </select>
          </div>
          <button type="submit" className="register-btn">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
