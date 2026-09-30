import './Navbar.css';

const Navbar = ({ isListening, onSettingsClick, onMicClick, onAboutClick }) => {
  return (
    <nav className="futuristic-nav">
      <div className="nav-container">
        <div className="logo-container">
          <span className="logo-text">J.U.N.I.O.R</span>
        </div>

        <ul className="nav-links">
          <li><a href="#home" className="nav-link active">HOME</a></li>
          <li>
            <button className="nav-link nav-btn" onClick={onAboutClick}>
              ABOUT
            </button>
          </li>
          <li>
            <a
              href="#mic"
              className={`nav-link ${isListening ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); onMicClick(); }}
              style={{ color: isListening ? '#ff0055' : undefined, textShadow: isListening ? '0 0 8px rgba(255, 0, 85, 0.8)' : undefined }}
            >
              MIC {isListening ? 'ON' : 'OFF'}
            </a>
          </li>
          <li>
            <a
              href="#settings"
              className="nav-link"
              onClick={(e) => { e.preventDefault(); onSettingsClick(); }}
            >
              SETTINGS
            </a>
          </li>
          <li><a href="#contact" className="nav-link">CONTACT</a></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
