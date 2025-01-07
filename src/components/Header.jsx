import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../theme/Header.css";

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <span className="logo-icon">🧠</span>
            <span className="logo-text">Mental Health Support</span>
          </Link>
        </div>

        <button
          className="mobile-menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="hamburger-icon"></span>
        </button>

        <nav className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <i className="fas fa-home"></i>
            <span>Home</span>
          </Link>
          <Link
            to="/about"
            className={`nav-link ${
              location.pathname === "/about" ? "active" : ""
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <i className="fas fa-info-circle"></i>
            <span>About</span>
          </Link>
          <Link
            to="/services"
            className={`nav-link ${
              location.pathname === "/services" ? "active" : ""
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <i className="fas fa-hands-helping"></i>
            <span>Services</span>
          </Link>
          <Link
            to="/dashboard"
            className={`nav-link ${
              location.pathname === "/dashboard" ? "active" : ""
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <i className="fas fa-chart-line"></i>
            <span>Dashboard</span>
          </Link>
          <Link
            to="/book-appointment"
            className={`nav-link book-now ${
              location.pathname === "/book-appointment" ? "active" : ""
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <i className="fas fa-calendar-check"></i>
            <span>Book Now</span>
          </Link>
          <Link
            to="/contact"
            className={`nav-link ${
              location.pathname === "/contact" ? "active" : ""
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <i className="fas fa-envelope"></i>
            <span>Contact</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
