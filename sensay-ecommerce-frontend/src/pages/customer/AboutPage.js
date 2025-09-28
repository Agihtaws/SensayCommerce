import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Lightbulb, MessageSquare, ShieldCheck } from 'lucide-react';
import '../../styles/AboutPage.css'; // Import the custom CSS

const AboutPage = () => {
  return (
    <div className="about-page-container">
      <h1 className="about-page-title">About Sensay Shop</h1>

      <div className="about-section">
        <h2 className="about-section-heading">Our Mission</h2>
        <p className="about-section-text">
          At Sensay Shop, our mission is to revolutionize the online shopping experience by seamlessly integrating cutting-edge Artificial Intelligence. We believe that shopping should be intuitive, personalized, and efficient, allowing you to find exactly what you need with ease and confidence. Our platform is built on the philosophy of smart commerce, where technology serves to enhance every step of your journey.
        </p>
      </div>

      <div className="about-features-grid">
        <div className="feature-card">
          <Lightbulb className="feature-icon feature-icon-blue" />
          <h3 className="feature-title">The Power of Sensay AI</h3>
          <p className="feature-text">
            Our core innovation is the deep integration of Sensay AI. This intelligent assistant is more than just a chatbot; it's your personal shopping companion. From providing instant product details and comparisons to offering tailored recommendations based on your preferences, Sensay AI ensures you make informed decisions and discover products you'll truly love. It's like having a knowledgeable sales associate available 24/7.
          </p>
        </div>
        <div className="feature-card">
          <MessageSquare className="feature-icon feature-icon-green" />
          <h3 className="feature-title">Personalized Experience</h3>
          <p className="feature-text">
            We understand that every shopper is unique. That's why Sensay Shop focuses on delivering a highly personalized experience. Our AI learns from your interactions, preferences, and even your past purchases to provide recommendations that truly resonate with your style and needs. Enjoy a shopping journey that feels curated just for you.
          </p>
        </div>
      </div>

      <div className="about-section about-trust-section">
        <ShieldCheck className="trust-icon trust-icon-purple" />
        <h3 className="trust-title">Security & Trust</h3>
        <p className="trust-text">
          Your trust and security are paramount. We utilize robust security measures to protect your personal information and ensure a safe shopping environment. Our transparent policies and commitment to customer satisfaction mean you can shop with complete peace of mind.
        </p>
        
      </div>

      <div className="about-cta-section">
        <p className="cta-text">Ready to explore our products?</p>
        <Link
          to="/products"
          className="btn btn-secondary start-shopping-btn"
        >
          <ShoppingCart className="start-shopping-icon" />
          Start Shopping Now
        </Link>
      </div>
    </div>
  );
};

export default AboutPage;
