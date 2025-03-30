import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/ForgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login attempt:", formData);
  };
  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <h2 className="forgot-title">Find your account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <div className="input-box">
              Please enter your email address to help us look for your account.
            </div>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="Email address"
              required
            />
          </div>

          <button type="submit" className="search-button">
            Search
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="cancel-button">
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
