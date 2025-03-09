import { useState } from "react";
import "../style/Register.css";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

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
            required
          >
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
  const navigate = useNavigate();
  const { register, loading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    rePassword: "",
    phoneNumber: "",
    address: "",
    gender: "",
    studentDetails: {
      grade: "",
      className: "",
      schoolName: "",
    },
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("-")) {
      // Handle hyphenated names for proper mapping
      const correctedName = name.replace("-", "");
      setFormData({
        ...formData,
        [correctedName]: value,
      });
      return;
    }

    // Handle nested studentDetails fields
    if (["grade", "className", "schoolName"].includes(name)) {
      setFormData({
        ...formData,
        studentDetails: {
          ...formData.studentDetails,
          [name]: name === "grade" ? parseInt(value, 10) || "" : value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Basic validation
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Email is invalid";

    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 8)
      errors.password = "Password must be at least 8 characters";

    if (formData.password !== formData.rePassword)
      errors.rePassword = "Passwords do not match";

    if (!formData.gender) errors.gender = "Gender is required";
    if (!formData.phoneNumber) errors.phoneNumber = "Phone number is required";
    if (!formData.address) errors.address = "Address is required";

    if (!formData.studentDetails.grade) errors.grade = "Grade is required";
    if (!formData.studentDetails.className)
      errors.className = "Class name is required";
    if (!formData.studentDetails.schoolName)
      errors.schoolName = "School name is required";

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Format gender to match API expectations
    const formattedData = {
      ...formData,
      gender: formData.gender.toUpperCase(),
    };

    // Remove rePassword as it's not needed for the API
    delete formattedData.rePassword;

    try {
      await register(formattedData);
      message.success("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      message.error(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            name="fullName"
            className={`form-control ${formErrors.fullName ? "error" : ""}`}
            placeholder="e.g. John Doe"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          {formErrors.fullName && (
            <div className="error-message">{formErrors.fullName}</div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Your email</label>
          <input
            type="email"
            name="email"
            className={`form-control ${formErrors.email ? "error" : ""}`}
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {formErrors.email && (
            <div className="error-message">{formErrors.email}</div>
          )}
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
        {formErrors.gender && (
          <div className="error-message">{formErrors.gender}</div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Grade</label>
          <input
            type="number"
            name="grade"
            className={`form-control ${formErrors.grade ? "error" : ""}`}
            placeholder="e.g. 10"
            value={formData.studentDetails.grade}
            onChange={handleChange}
            required
          />
          {formErrors.grade && (
            <div className="error-message">{formErrors.grade}</div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Class Name</label>
          <input
            type="text"
            name="className"
            className={`form-control ${formErrors.className ? "error" : ""}`}
            placeholder="e.g. B"
            value={formData.studentDetails.className}
            onChange={handleChange}
            required
          />
          {formErrors.className && (
            <div className="error-message">{formErrors.className}</div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">School Name</label>
        <input
          type="text"
          name="schoolName"
          className={`form-control ${formErrors.schoolName ? "error" : ""}`}
          placeholder="e.g. Example School"
          value={formData.studentDetails.schoolName}
          onChange={handleChange}
          required
        />
        {formErrors.schoolName && (
          <div className="error-message">{formErrors.schoolName}</div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            className={`form-control ${formErrors.phoneNumber ? "error" : ""}`}
            placeholder="e.g. 1234567890"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
          {formErrors.phoneNumber && (
            <div className="error-message">{formErrors.phoneNumber}</div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <input
            type="text"
            name="address"
            className={`form-control ${formErrors.address ? "error" : ""}`}
            placeholder="e.g. 123 Main St"
            value={formData.address}
            onChange={handleChange}
            required
          />
          {formErrors.address && (
            <div className="error-message">{formErrors.address}</div>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            className={`form-control ${formErrors.password ? "error" : ""}`}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {formErrors.password && (
            <div className="error-message">{formErrors.password}</div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            name="rePassword"
            className={`form-control ${formErrors.rePassword ? "error" : ""}`}
            placeholder="••••••••"
            value={formData.rePassword}
            onChange={handleChange}
            required
          />
          {formErrors.rePassword && (
            <div className="error-message">{formErrors.rePassword}</div>
          )}
        </div>
      </div>

      <button type="submit" className="register-btn" disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </button>

      {error && <div className="error-message form-error">{error}</div>}
    </form>
  );
}

function ParentForm() {
  return <div>Parent registration form will be implemented here</div>;
}
