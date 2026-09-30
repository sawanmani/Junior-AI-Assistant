import { useState, useEffect } from 'react';
import './Widgets.css';
import './TimeWidget.css';
import ResizeHandle from './ResizeHandle';

const TimeWidget = ({ config, style, onPointerDown, onPointerMove, onPointerUp, onResize }) => {
  const [time, setTime] = useState(new Date());
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setBlink(prev => !prev);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const dayName = dayNames[time.getDay()];
  const dayNum = time.getDate();
  const month = monthNames[time.getMonth()];
  const year = time.getFullYear();

  return (
    <div
      className="sci-fi-clock"
      style={style}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="clock-header" onPointerDown={onPointerDown}>
        <div className="header-line left"></div>
        <span className="header-title">TEMPORAL CORE</span>
        <div className="header-line right"></div>
      </div>

      <div className="clock-body">
        {/* Circular time display */}
        <div className="time-ring">
          <svg viewBox="0 0 200 200" className="ring-svg">
            {/* Outer ring */}
            <circle cx="100" cy="100" r="95" className="ring-outer" />
            {/* Inner ring with dashes */}
            <circle cx="100" cy="100" r="85" className="ring-inner" />
            {/* Progress arc for seconds */}
            <circle
              cx="100"
              cy="100"
              r="75"
              className="ring-progress"
              strokeDasharray={`${(parseInt(seconds) / 60) * 471} 471`}
            />
          </svg>

          {/* Digital time in center */}
          <div className="digital-time">
            <span className="time-hours">{hours}</span>
            <span className={`time-colon ${blink ? 'blink-on' : 'blink-off'}`}>:</span>
            <span className="time-minutes">{minutes}</span>
            <div className="seconds-display">
              <span className="seconds-num">{seconds}</span>
            </div>
          </div>
        </div>

        {/* Date display */}
        <div className="date-section">
          <div className="date-row">
            <span className="date-label">CYCLE</span>
            <span className="date-value day">{dayName}</span>
          </div>
          <div className="date-row">
            <span className="date-label">DATE</span>
            <span className="date-value full">{dayNum} {month} {year}</span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="decorative-line top"></div>
        <div className="decorative-line bottom"></div>
        <div className="corner-accent top-left"></div>
        <div className="corner-accent top-right"></div>
        <div className="corner-accent bottom-left"></div>
        <div className="corner-accent bottom-right"></div>
      </div>
      <ResizeHandle 
        onResize={onResize} 
        width={config?.width} 
        height={config?.height} 
      />
    </div>
  );
};

export default TimeWidget;
