import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your form submission logic here
    console.log("Form submitted:", formData);
  };

  return (
    <div className="main-wrapper general-wrapper">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Contact Us</h1>
          <p className="hero-subtitle">
            We are here to help and answer any questions you might have
          </p>
        </div>
      </div>

      <div className="page-content">
        <div className="contact-grid">
          <div className="contact-info-section">
            <div className="contact-card">
              <i className="fas fa-map-marker-alt"></i>
              <h3>Visit Us</h3>
              <p>123 Campus Drive</p>
              <p>Student Center, Room 200</p>
            </div>
            <div className="contact-card">
              <i className="fas fa-phone"></i>
              <h3>Call Us</h3>
              <p>Main: (123) 456-7890</p>
              <p>Crisis Line: (123) 456-7899</p>
            </div>
            <div className="contact-card">
              <i className="fas fa-envelope"></i>
              <h3>Email Us</h3>
              <p>support@mindcare.edu</p>
              <p>help@mindcare.edu</p>
            </div>
            <div className="contact-card">
              <i className="fas fa-clock"></i>
              <h3>Office Hours</h3>
              <p>Monday - Friday: 8am - 6pm</p>
              <p>Weekend: 9am - 1pm</p>
            </div>
          </div>

          <div className="contact-form-section">
            <h2>Send us a Message</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <select
                  id="subject"
                  name="subject"
                  className="form-control"
                  value={formData.subject}
                  onChange={handleChange}
                  required>
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="appointment">Appointment Related</option>
                  <option value="feedback">Feedback</option>
                  <option value="urgent">Urgent Matter</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  className="form-control"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
