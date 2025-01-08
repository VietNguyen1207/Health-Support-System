import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faUsers,
  faBrain,
  faHandHoldingHeart,
} from "@fortawesome/free-solid-svg-icons";

const Service = () => {
  return (
    <div>
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Our Services</h1>
          <p className="hero-subtitle">
            Comprehensive Mental Health Support for Students
          </p>
        </div>
      </div>

      <div className="page-content">
        <div className="services-grid">
          <div className="service-card">
            <FontAwesomeIcon icon={faComments} />
            <h3>Individual Counseling</h3>
            <p>
              One-on-one sessions with professional counselors to address
              personal concerns.
            </p>
            <Link to="/book-appointment" className="btn btn-primary">
              Book Session
            </Link>
          </div>

          <div className="service-card">
            <FontAwesomeIcon icon={faUsers} />
            <h3>Group Therapy</h3>
            <p>
              Supportive group sessions focusing on common challenges and shared
              experiences.
            </p>
            <Link to="/book-appointment" className="btn btn-primary">
              Join Group
            </Link>
          </div>

          <div className="service-card">
            <FontAwesomeIcon icon={faBrain} />
            <h3>Mental Health Workshops</h3>
            <p>
              Educational sessions on stress management, anxiety, and other
              relevant topics.
            </p>
            <Link to="/book-appointment" className="btn btn-primary">
              Register
            </Link>
          </div>

          <div className="service-card">
            <FontAwesomeIcon icon={faHandHoldingHeart} />
            <h3>Crisis Support</h3>
            <p>24/7 emergency support for students in crisis situations.</p>
            <Link to="/book-appointment" className="btn btn-primary">
              Get Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Service;
