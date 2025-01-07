import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [resources, setResources] = useState([]);
  const [counselors, setCounselors] = useState([]);

  return (
    <>
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Mental Health Resources</h1>
          <p className="hero-subtitle">
            Supporting Student Mental Health and Wellness
          </p>
        </div>
      </div>

      <div className="page-content">
        <div className="home-grid">
          <div className="quick-actions-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions-grid">
              <Link to="/book-appointment" className="action-card">
                <i className="fas fa-calendar-check"></i>
                <h3>Book Session</h3>
                <p>Schedule a counseling session</p>
              </Link>
              <Link to="/emergency" className="action-card">
                <i className="fas fa-phone-alt"></i>
                <h3>Emergency Help</h3>
                <p>24/7 Crisis Support</p>
              </Link>
              <Link to="/support-groups" className="action-card">
                <i className="fas fa-user-friends"></i>
                <h3>Support Groups</h3>
                <p>Join group sessions</p>
              </Link>
              <Link to="/resources" className="action-card">
                <i className="fas fa-book-reader"></i>
                <h3>Self-Help Resources</h3>
                <p>Access wellness materials</p>
              </Link>
            </div>
          </div>

          <div className="resources-section">
            <h2>Featured Resources</h2>
            <div className="resources">
              {resources.map((resource, index) => (
                <div key={index} className="resource-card">
                  <h3 className="resource-title">{resource.title}</h3>
                  <span className="resource-category">{resource.category}</span>
                  <p>{resource.description}</p>
                  {resource.schedule && (
                    <p>
                      <strong>Schedule:</strong> {resource.schedule}
                    </p>
                  )}
                  {resource.duration && (
                    <p>
                      <strong>Duration:</strong> {resource.duration}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="counselors-section">
            <h2>Our Counselors</h2>
            <div>
              {counselors.map((counselor, index) => (
                <div key={index} className="counselor-card">
                  <h3>{counselor.name}</h3>
                  <p>
                    <strong>Specialization:</strong> {counselor.specialization}
                  </p>
                  <p>
                    <strong>Availability:</strong> {counselor.availability}
                  </p>
                  <p>
                    <strong>Experience:</strong> {counselor.experience}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="wellness-section">
            <h2>Daily Wellness Tips</h2>
            <div className="wellness-grid">
              <div className="wellness-card">
                <i className="fas fa-heart"></i>
                <h3>Mental Health</h3>
                <p>Practice mindfulness for 10 minutes daily</p>
              </div>
              <div className="wellness-card">
                <i className="fas fa-bed"></i>
                <h3>Sleep</h3>
                <p>Maintain a consistent sleep schedule</p>
              </div>
              <div className="wellness-card">
                <i className="fas fa-running"></i>
                <h3>Exercise</h3>
                <p>Stay active for at least 30 minutes</p>
              </div>
              <div className="wellness-card">
                <i className="fas fa-apple-alt"></i>
                <h3>Nutrition</h3>
                <p>Eat balanced, regular meals</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
