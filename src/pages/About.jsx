export default function About() {
  return (
    <div className="general-wrapper">
      <div className="hero-section bg-emerald-gradient">
        <div className="hero-content">
          <h1 className="hero-title">About MindCare</h1>
          <p className="hero-subtitle">
            Supporting Student Mental Health and Wellness
          </p>
        </div>
      </div>

      <div className="page-content">
        <div className="about-section">
          <div className="about-content">
            <h2>Our Mission</h2>
            <p>
              At MindCare, we are dedicated to providing comprehensive mental
              health support to students, ensuring they have the resources and
              guidance needed to thrive academically and personally.
            </p>

            <h2>Our Approach</h2>
            <p>
              We believe in a holistic approach to mental health, combining
              professional counseling, peer support, and educational resources
              to create a supportive environment for all students.
            </p>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>2000+</h3>
                <p>Students Supported</p>
              </div>
              <div className="stat-card">
                <h3>15+</h3>
                <p>Professional Counselors</p>
              </div>
              <div className="stat-card">
                <h3>24/7</h3>
                <p>Support Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
