import React from 'react';
import './Footer.css';
import { FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa'; // Using React Icons

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Brand Column */}
        <div className="footer-section">
          <div className="logo-container">
            <img src="/logo.png" alt="OnBeat Logo" className="footer-logo" />
            <span className="brand-name">BeOnBeat</span>
          </div>
          <p className="brand-tagline">Your ultimate music experience</p>
          <div className="social-icons">
            <a href="#"><FaInstagram className="icon" /></a>
            <a href="#"><FaTwitter className="icon" /></a>
            <a href="#"><FaYoutube className="icon" /></a>
          </div>
        </div>

        {/* Links Column */}
        <div className="footer-section">
          <h3 className="section-title">Quick Links</h3>
          <ul className="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/music">Music</a></li>
            <li><a href="/pricing">Pricing</a></li>
          </ul>
        </div>

        {/* Contact Column */}
        <div className="footer-section">
          <h3 className="section-title">Contact</h3>
          <ul className="footer-links">
            <li><a href="mailto:info@beonbeat.com">info@beonbeat.com</a></li>
            <li><a href="tel:+1234567890">+1 (234) 567-890</a></li>
            <li>123 Music Ave, Sound City</li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="footer-section">
          <h3 className="section-title">Newsletter</h3>
          <p className="newsletter-text">Subscribe for updates</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Your email" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} BeOnBeat. All rights reserved.</p>
        <div className="legal-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;