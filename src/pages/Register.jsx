import { useState } from "react";
import "../style/Register.css";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import PropTypes from "prop-types";

const RequiredLabel = ({ text }) => (
  <label className="form-label">
    {text} <span className="text-red-500">*</span>
  </label>
);

RequiredLabel.propTypes = {
  text: PropTypes.string.isRequired,
};

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
          Already have an account? <a href="/">Login here</a>
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
      // Xử lý đặc biệt cho trường grade
      if (name === "grade") {
        let gradeValue = parseInt(value, 10) || "";

        // Nếu người dùng đã nhập một số
        if (gradeValue !== "") {
          // Giới hạn giá trị trong khoảng từ 1 đến 12
          if (gradeValue < 10) gradeValue = 10;
          if (gradeValue > 12) gradeValue = 12;
        }

        setFormData({
          ...formData,
          studentDetails: {
            ...formData.studentDetails,
            grade: gradeValue,
          },
        });
      }
      // Xử lý đặc biệt cho trường className
      else if (name === "className") {
        // Lấy chữ cái đầu tiên từ input và chuyển đổi thành chữ hoa
        let classLetter = "";
        if (value) {
          // Lấy chữ cái đầu tiên và chuyển đổi thành chữ hoa
          const firstChar = value.charAt(0).toUpperCase();

          // Kiểm tra xem ký tự đầu tiên có phải là chữ cái từ A-Z không
          if (/^[A-Z]$/.test(firstChar)) {
            classLetter = firstChar;
          }
        }

        setFormData({
          ...formData,
          studentDetails: {
            ...formData.studentDetails,
            className: classLetter,
          },
        });
      } else {
        // Xử lý bình thường cho các trường khác
        setFormData({
          ...formData,
          studentDetails: {
            ...formData.studentDetails,
            [name]: value,
          },
        });
      }
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
    else if (!formData.email.endsWith("@cybriadev.com"))
      errors.email = "Please use an email with @cybriadev.com domain";

    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 8)
      errors.password = "Password must be at least 8 characters";

    if (formData.password !== formData.rePassword)
      errors.rePassword = "Passwords do not match";

    if (!formData.gender) errors.gender = "Gender is required";

    // Phone number validation for Vietnam
    if (!formData.phoneNumber) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Phone number must be exactly 10 digits";
    } else if (!/^(03|05|07|08|09)\d{8}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Please enter a valid Vietnamese phone number";
    }

    if (!formData.address) errors.address = "Address is required";

    // Grade validation
    if (!formData.studentDetails.grade) {
      errors.grade = "Grade is required";
    } else {
      const gradeValue = Number(formData.studentDetails.grade);
      if (isNaN(gradeValue)) {
        errors.grade = "Grade must be a number";
      } else if (gradeValue < 10 || gradeValue > 12) {
        errors.grade = "Grade must be between 10 and 12";
      }
    }

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
      navigate("/");
    } catch (err) {
      message.error(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <RequiredLabel text="Full Name" />
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
            <div className="error-message text-red-500">
              {formErrors.fullName}
            </div>
          )}
        </div>
        <div className="form-group">
          <RequiredLabel text="Your email" />
          <input
            type="email"
            name="email"
            className={`form-control ${formErrors.email ? "error" : ""}`}
            placeholder="name@cybriadev.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {formErrors.email && (
            <div className="error-message text-red-500">{formErrors.email}</div>
          )}
        </div>
      </div>

      <div className="form-group">
        <RequiredLabel text="Gender" />
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
          <div className="error-message text-red-500">{formErrors.gender}</div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <RequiredLabel text="Grade" />
          <input
            type="number"
            name="grade"
            className={`form-control ${formErrors.grade ? "error" : ""}`}
            placeholder="e.g. 10"
            value={formData.studentDetails.grade}
            onChange={handleChange}
            max={12}
            min={10}
            required
          />
          {formErrors.grade && (
            <div className="error-message text-red-500">{formErrors.grade}</div>
          )}
        </div>
        <div className="form-group">
          <RequiredLabel text="Class Name" />
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
            <div className="error-message text-red-500">
              {formErrors.className}
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <RequiredLabel text="School Name" />
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
          <div className="error-message text-red-500">
            {formErrors.schoolName}
          </div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <RequiredLabel text="Phone Number" />
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
            <div className="error-message text-red-500">
              {formErrors.phoneNumber}
            </div>
          )}
        </div>
        <div className="form-group">
          <RequiredLabel text="Address" />
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
            <div className="error-message text-red-500">
              {formErrors.address}
            </div>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <RequiredLabel text="Password" />
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
            <div className="error-message text-red-500">
              {formErrors.password}
            </div>
          )}
        </div>
        <div className="form-group">
          <RequiredLabel text="Confirm Password" />
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
            <div className="error-message text-red-500">
              {formErrors.rePassword}
            </div>
          )}
        </div>
      </div>

      <button type="submit" className="register-btn" disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </button>

      {error && (
        <div className="error-message text-red-500 form-error">{error}</div>
      )}
    </form>
  );
}

function ParentForm() {
  const navigate = useNavigate();
  const { registerParent, loading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    rePassword: "",
    phoneNumber: "",
    address: "",
    gender: "",
    childrenDetails: {
      studentIds: [""],
    },
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested childrenDetails fields
    if (name === "studentId") {
      setFormData({
        ...formData,
        childrenDetails: {
          ...formData.childrenDetails,
          studentIds: [value],
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

  const addStudentId = () => {
    setFormData({
      ...formData,
      childrenDetails: {
        ...formData.childrenDetails,
        studentIds: [...formData.childrenDetails.studentIds, ""],
      },
    });
  };

  const removeStudentId = (index) => {
    const updatedStudentIds = [...formData.childrenDetails.studentIds];
    updatedStudentIds.splice(index, 1);

    setFormData({
      ...formData,
      childrenDetails: {
        ...formData.childrenDetails,
        studentIds: updatedStudentIds,
      },
    });
  };

  const handleStudentIdChange = (index, value) => {
    const updatedStudentIds = [...formData.childrenDetails.studentIds];
    updatedStudentIds[index] = value;

    setFormData({
      ...formData,
      childrenDetails: {
        ...formData.childrenDetails,
        studentIds: updatedStudentIds,
      },
    });

    // Clear error for this field if it exists
    if (formErrors[`studentId-${index}`]) {
      setFormErrors({
        ...formErrors,
        [`studentId-${index}`]: null,
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Basic validation
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!formData.email.endsWith("@cybriadev.com"))
      errors.email = "Please use an email with @cybriadev.com domain";

    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 8)
      errors.password = "Password must be at least 8 characters";
    else if (
      !/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]/.test(
        formData.password
      )
    ) {
      errors.password =
        "Password must include uppercase, lowercase, number, and special character";
    }

    if (formData.password !== formData.rePassword)
      errors.rePassword = "Passwords do not match";

    if (!formData.gender) errors.gender = "Gender is required";

    // Phone number validation for Vietnam
    if (!formData.phoneNumber) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Phone number must be exactly 10 digits";
    } else if (!/^(03|05|07|08|09)\d{8}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Please enter a valid Vietnamese phone number";
    }

    if (!formData.address) errors.address = "Address is required";

    // Validate student IDs
    formData.childrenDetails.studentIds.forEach((studentId, index) => {
      if (!studentId.trim()) {
        errors[`studentId-${index}`] = "Student ID is required";
      }
    });

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
      // Filter out empty student IDs
      childrenDetails: {
        studentIds: formData.childrenDetails.studentIds.filter(
          (id) => id.trim() !== ""
        ),
      },
    };

    // Remove rePassword as it's not needed for the API
    delete formattedData.rePassword;

    try {
      await registerParent(formattedData);
      message.success("Parent registration successful! Please login.");
      navigate("/");
    } catch (err) {
      message.error(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <RequiredLabel text="Full Name" />
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
            <div className="error-message text-red-500">
              {formErrors.fullName}
            </div>
          )}
        </div>
        <div className="form-group">
          <RequiredLabel text="Your email" />
          <input
            type="email"
            name="email"
            className={`form-control ${formErrors.email ? "error" : ""}`}
            placeholder="name@cybriadev.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {formErrors.email && (
            <div className="error-message text-red-500">{formErrors.email}</div>
          )}
        </div>
      </div>

      <div className="form-group">
        <RequiredLabel text="Gender" />
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
          <div className="error-message text-red-500">{formErrors.gender}</div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <RequiredLabel text="Phone Number" />
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
            <div className="error-message text-red-500">
              {formErrors.phoneNumber}
            </div>
          )}
        </div>
        <div className="form-group">
          <RequiredLabel text="Address" />
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
            <div className="error-message text-red-500">
              {formErrors.address}
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <RequiredLabel text="Children's Student IDs" />
        <p className="text-sm text-gray-500 mb-2">
          Enter the student ID(s) of your children
        </p>

        {formData.childrenDetails.studentIds.map((studentId, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              className={`form-control ${
                formErrors[`studentId-${index}`] ? "error" : ""
              }`}
              placeholder="e.g. STU001"
              value={studentId}
              onChange={(e) => handleStudentIdChange(index, e.target.value)}
              required
            />

            {index > 0 && (
              <button
                type="button"
                className="ml-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={() => removeStudentId(index)}>
                Remove
              </button>
            )}

            {formErrors[`studentId-${index}`] && (
              <div className="error-message text-red-500 ml-2">
                {formErrors[`studentId-${index}`]}
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          className="mt-2 px-3 py-2 bg-custom-green text-white rounded-md hover:custome-green"
          onClick={addStudentId}>
          Add Another Student ID
        </button>
      </div>

      <div className="form-row">
        <div className="form-group">
          <RequiredLabel text="Password" />
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
            <div className="error-message text-red-500">
              {formErrors.password}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Password must be at least 8 characters and include uppercase,
            lowercase, number, and special character
          </p>
        </div>
        <div className="form-group">
          <RequiredLabel text="Confirm Password" />
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
            <div className="error-message text-red-500">
              {formErrors.rePassword}
            </div>
          )}
        </div>
      </div>

      <button type="submit" className="register-btn" disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </button>

      {error && (
        <div className="error-message text-red-500 form-error">{error}</div>
      )}
    </form>
  );
}
