import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

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
          aria-label="Toggle menu">
          <span className="hamburger-icon"></span>
        </button>

        <nav className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
            onClick={() => setIsMenuOpen(false)}>
            <span>Home</span>
          </Link>
          <Link
            to="/about"
            className={`nav-link ${
              location.pathname === "/about" ? "active" : ""
            }`}
            onClick={() => setIsMenuOpen(false)}>
            <span>About</span>
          </Link>
          <Link
            to="/services"
            className={`nav-link ${
              location.pathname === "/services" ? "active" : ""
            }`}
            onClick={() => setIsMenuOpen(false)}>
            <span>Services</span>
          </Link>
          <Link
            to="/dashboard"
            className={`nav-link ${
              location.pathname === "/dashboard" ? "active" : ""
            }`}
            onClick={() => setIsMenuOpen(false)}>
            <span>Dashboard</span>
          </Link>
          <Link
            to="/contact"
            className={`nav-link ${
              location.pathname === "/contact" ? "active" : ""
            }`}
            onClick={() => setIsMenuOpen(false)}>
            <span>Contact</span>
          </Link>
          <Link
            to="/book-appointment"
            className={`nav-link book-now ${
              location.pathname === "/book-appointment" ? "active" : ""
            }`}
            onClick={() => setIsMenuOpen(false)}>
            <span>Book Now</span>
          </Link>
          <div className="nav-actions" id="authButtons">
            <Link to="/register" className="btn btn-outline">
              Sign Up
            </Link>
            <Link to="/login" className="btn btn-primary">
              Sign In
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
