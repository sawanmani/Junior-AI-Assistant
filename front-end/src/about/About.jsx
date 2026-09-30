import { useState, useEffect } from 'react';
import './About.css';
import profilePic from './ME-1.jpg';

function About({ onClose }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [particles, setParticles] = useState([]);

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  const techStack = [
    { name: 'React 19', icon: '⚛️', desc: 'Frontend Framework' },
    { name: 'Vite', icon: '⚡', desc: 'Build Tool' },
    { name: 'Three.js', icon: '🎮', desc: '3D Graphics' },
    { name: 'Node.js', icon: '📦', desc: 'Backend Runtime' },
    { name: 'Express', icon: '🚂', desc: 'Web Framework' },
    { name: 'Groq API', icon: '🧠', desc: 'LLM Processing' },
    { name: 'Open-Meteo', icon: '🌤️', desc: 'Weather Data' },
    { name: 'Web Speech API', icon: '🎤', desc: 'Voice Recognition' },
  ];

  const features = [
    { icon: '🎯', title: 'Voice Control', desc: 'Wake word "Junior" activates AI assistant' },
    { icon: '🌐', title: 'Web Navigation', desc: 'Open websites & search automatically' },
    { icon: '💻', title: 'App Launcher', desc: 'Launch installed applications' },
    { icon: '🌤️', title: 'Weather Widget', desc: 'Real-time location-based forecasts' },
    { icon: '🎨', title: '3D Blob Visual', desc: 'Audio-reactive plasma sphere' },
    { icon: '🔊', title: 'Text-to-Speech', desc: 'Natural AI voice responses' },
    { icon: '📝', title: 'Quick Notes', desc: 'Built-in note-taking widget' },
    { icon: '🎵', title: 'Music Player', desc: 'Integrated music controls' },
  ];

  return (
    <div className="about-overlay" onClick={onClose}>
      <div className="about-container" onClick={(e) => e.stopPropagation()}>
        {/* Animated Background Particles */}
        <div className="particles-container">
          {particles.map((p) => (
            <div
              key={p.id}
              className="particle"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Close Button */}
        <button className="about-close" onClick={onClose}>
          <span>✕</span>
        </button>

        {/* Header Section */}
        <div className="about-header">
          <div className="about-title-wrapper">
            <h1 className="about-title">
              <span className="gradient-text">JUNIOR</span>
              <span className="subtitle">AI Assistant</span>
            </h1>
            <div className="about-version">v1.0.0</div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-frame">
            <div className="frame-border">
              <div className="frame-corner top-left"></div>
              <div className="frame-corner top-right"></div>
              <div className="frame-corner bottom-left"></div>
              <div className="frame-corner bottom-right"></div>
            </div>
            <div className="profile-image-wrapper">
              <img src={profilePic} alt="Adarsh Mani Tripathi" className="profile-image" />
              <div className="profile-glow"></div>
            </div>
            <div className="frame-accent"></div>
          </div>
          
          <div className="profile-info">
            <h2 className="profile-name">Adarsh Mani Tripathi</h2>
            <p className="profile-title">Computer Science Engineering Student</p>
            <p className="profile-university">
              Dr. Shakuntala Misra National Rehabilitation University
            </p>
            <p className="profile-batch">Batch 2023-2027</p>
            <div className="profile-divider"></div>
            <p className="profile-tagline">Creator of JUNIOR AI Assistant</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="about-tabs">
          {['overview', 'features', 'tech'].map((tab) => (
            <button
              key={tab}
              className={`about-tab ${activeSection === tab ? 'active' : ''}`}
              onClick={() => setActiveSection(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="about-content">
          {activeSection === 'overview' && (
            <div className="section overview-section">
              <h3 className="section-title">
                <span className="icon">🚀</span> Project Overview
              </h3>
              <p className="section-text">
                <strong className="highlight">JUNIOR</strong> is an advanced AI-powered desktop assistant 
                designed to enhance productivity through voice commands and intelligent automation. 
                Built with cutting-edge web technologies, it seamlessly integrates with your workflow 
                to provide hands-free control over applications, websites, and information retrieval.
              </p>
              <div className="overview-grid">
                <div className="overview-card">
                  <div className="card-icon">🎙️</div>
                  <div className="card-title">Voice First</div>
                  <div className="card-desc">Natural language processing with wake word detection</div>
                </div>
                <div className="overview-card">
                  <div className="card-icon">🤖</div>
                  <div className="card-title">AI Powered</div>
                  <div className="card-desc">Groq LLM for intelligent responses</div>
                </div>
                <div className="overview-card">
                  <div className="card-icon">🎨</div>
                  <div className="card-title">Modern UI</div>
                  <div className="card-desc">Futuristic glassmorphism design</div>
                </div>
                <div className="overview-card">
                  <div className="card-icon">⚡</div>
                  <div className="card-title">Real-time</div>
                  <div className="card-desc">Instant responses and live data</div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'features' && (
            <div className="section features-section">
              <h3 className="section-title">
                <span className="icon">✨</span> Features
              </h3>
              <div className="features-grid">
                {features.map((feature, idx) => (
                  <div key={idx} className="feature-card">
                    <div className="feature-icon">{feature.icon}</div>
                    <div className="feature-title">{feature.title}</div>
                    <div className="feature-desc">{feature.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'tech' && (
            <div className="section tech-section">
              <h3 className="section-title">
                <span className="icon">🛠️</span> Technology Stack
              </h3>
              <div className="tech-grid">
                {techStack.map((tech, idx) => (
                  <div key={idx} className="tech-card">
                    <div className="tech-icon">{tech.icon}</div>
                    <div className="tech-name">{tech.name}</div>
                    <div className="tech-desc">{tech.desc}</div>
                  </div>
                ))}
              </div>
              
              <div className="how-it-works">
                <h4 className="subsection-title">How It Works</h4>
                <div className="workflow">
                  <div className="workflow-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <strong>Voice Input</strong>
                      <span>Web Speech API captures your voice commands</span>
                    </div>
                  </div>
                  <div className="workflow-arrow">↓</div>
                  <div className="workflow-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <strong>Processing</strong>
                      <span>Groq LLM understands and processes requests</span>
                    </div>
                  </div>
                  <div className="workflow-arrow">↓</div>
                  <div className="workflow-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <strong>Action</strong>
                      <span>Backend executes commands (open apps, websites, etc.)</span>
                    </div>
                  </div>
                  <div className="workflow-arrow">↓</div>
                  <div className="workflow-step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <strong>Response</strong>
                      <span>Text-to-Speech delivers audio response</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="about-footer">
          <div className="footer-text">
            Made with <span className="heart">❤️</span> by Adarsh Mani Tripathi © 2026
          </div>
          <div className="footer-tech">
            Powered by React • Node.js • Groq AI • Three.js
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
