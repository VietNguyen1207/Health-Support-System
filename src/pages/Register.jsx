import { useState } from "react";
import "../style/Register.css";

export default function Register() {
  const [userType, setUserType] = useState("student");

  const handleChange = (e) => {
    setUserType(e.target.value);
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2 className="register-title">Start your website in seconds</h2>
        <p className="login-text">
          Already have an account? <a href="/login">Login here</a>
        </p>
        <div className="form-group">
          <label className="form-label">User Type</label>
          <select
            className="form-control"
            name="userType"
            value={userType}
            onChange={handleChange}
            required>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
          </select>
        </div>
        {userType === "student" ? <StudentForm /> : <ParentForm />}
      </div>
    </div>
  );
}

function StudentForm() {
  // Add state management
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    rePassword: "",
    dateOfBirth: "",
    role: "student",
    gender: "",
    grade: "",
    phoneNumber: "",
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
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            name="fullname"
            className="form-control"
            placeholder="e.g. Bonnie Green"
            value={formData.fullname}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Your email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="name@company.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Gender</label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={formData.gender === "male"}
              onChange={handleChange}
              required
            />
            Male
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={formData.gender === "female"}
              onChange={handleChange}
              required
            />
            Female
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="gender"
              value="other"
              checked={formData.gender === "other"}
              onChange={handleChange}
              required
            />
            Other
          </label>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Grade</label>
          <input
            type="number"
            name="grade"
            className="form-control"
            placeholder="e.g. 12"
            value={formData.grade}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input
            type="text"
            name="phone-number"
            className="form-control"
            placeholder="e.g. 081234567xxx"
            value={formData.phoneNumber}
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
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="••••••••"
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
            placeholder="••••••••"
            value={formData.rePassword}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <button type="submit" className="register-btn">
        Create account
      </button>
    </form>
  );
}

function ParentForm() {
  return <div>ParentForm</div>;
}
