import { useState, useEffect } from 'react';
import './Widgets.css';
import ResizeHandle from './ResizeHandle';

const DateTimeWidget = ({ config, style, onPointerDown, onPointerMove, onPointerUp, onResize }) => {
  const [time, setTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const dateString = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div
      className={`glass-widget shape-cut dateTime-widget ${isMobile ? 'mobile' : 'desktop'}`}
      style={style}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="widget-header" onPointerDown={onPointerDown}>
        <span className="widget-title">CHRONOS</span>
      </div>
      <div className="widget-content" style={{ textAlign: 'center', padding: isMobile ? '15px 8px' : '20px 10px' }}>
        <div className="time-display" style={{ fontSize: isMobile ? '1.2rem' : '1.8rem', fontWeight: '900', color: '#00ffe1', textShadow: '0 0 15px rgba(0,255,225,0.6)' }}>
          {timeString}
        </div>
        <div style={{ fontSize: isMobile ? '0.55rem' : '0.7rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '2px', marginTop: '8px' }}>
          {dateString.toUpperCase()}
        </div>
      </div>
      <ResizeHandle 
        onResize={onResize} 
        width={config?.width} 
        height={config?.height} 
      />
    </div>
  );
};

export default DateTimeWidget;
