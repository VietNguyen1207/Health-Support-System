export default function Footer() {
  return (
    <div className="main-wrapper">
      <footer className="footer ">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-section">
              <h3>MindCare</h3>
              <p>
                Supporting student mental health and wellness through
                professional care and guidance.
              </p>
              <div className="social-links">
                <a href="#">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="#">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li>
                  <a href="#">About Us</a>
                </li>
                <li>
                  <a href="#">Services</a>
                </li>
                <li>
                  <a href="#">Book Session</a>
                </li>
                <li>
                  <a href="#">Contact</a>
                </li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Contact Info</h4>
              <ul className="contact-info">
                <li>
                  <i className="fas fa-phone"></i> (123) 456-7890
                </li>
                <li>
                  <i className="fas fa-envelope"></i> support@mindcare.edu
                </li>
                <li>
                  <i className="fas fa-map-marker-alt"></i> 123 Campus Drive
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
