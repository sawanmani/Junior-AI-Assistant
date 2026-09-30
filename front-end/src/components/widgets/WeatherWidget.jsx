import { useState, useEffect } from 'react';
import './Widgets.css';
import ResizeHandle from './ResizeHandle';

const WeatherWidget = ({ config, style, onPointerDown, onPointerMove, onPointerUp, onResize }) => {
  const [weather, setWeather] = useState({
    temp: '--',
    condition: 'LOADING...',
    humidity: '--',
    location: 'DETECTING...'
  });
  const [locationError, setLocationError] = useState(false);

  // Weather emoji mapping
  const getWeatherEmoji = (condition) => {
    const conditionUpper = condition.toUpperCase();
    if (conditionUpper.includes('CLEAR') || conditionUpper.includes('SUN')) return '☀️';
    if (conditionUpper.includes('CLOUD')) return '☁️';
    if (conditionUpper.includes('RAIN') || conditionUpper.includes('DRIZZLE')) return '🌧️';
    if (conditionUpper.includes('THUNDER')) return '⛈️';
    if (conditionUpper.includes('SNOW')) return '❄️';
    if (conditionUpper.includes('FOG') || conditionUpper.includes('MIST')) return '🌫️';
    if (conditionUpper.includes('WIND')) return '💨';
    return '🌡️';
  };

  useEffect(() => {
    // Request user's location and fetch weather
    const getWeatherWithLocation = async () => {
      if (!navigator.geolocation) {
        setWeather({
          temp: '--',
          condition: 'OFFLINE',
          humidity: 'N/A',
          location: 'GEO NOT SUPPORTED'
        });
        setLocationError(true);
        return;
      }

      try {
        console.log('[WEATHER] Requesting location...');

        // Fetch weather using browser's geolocation
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              console.log('[WEATHER] Location:', latitude, longitude);

              const response = await fetch(`http://localhost:5000/api/weather/coords?lat=${latitude}&lon=${longitude}`);

              if (!response.ok) {
                throw new Error('Weather API error');
              }

              const data = await response.json();
              console.log('[WEATHER] Data:', data);
              setWeather(data);
              setLocationError(false);
            } catch (error) {
              console.error('[WEATHER] Failed to fetch:', error);
              setWeather({
                temp: '--',
                condition: 'OFFLINE',
                humidity: 'N/A',
                location: 'UNAVAILABLE'
              });
              setLocationError(true);
            }
          },
          (error) => {
            console.error('[WEATHER] Geolocation error:', error.message);
            setWeather({
              temp: '--',
              condition: 'LOCATION DENIED',
              humidity: 'N/A',
              location: 'PERMISSION REQUIRED'
            });
            setLocationError(true);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000 // Cache for 5 minutes
          }
        );
      } catch (error) {
        console.error('[WEATHER] Geolocation failed:', error);
        setWeather({
          temp: '--',
          condition: 'ERROR',
          humidity: 'N/A',
          location: 'UNAVAILABLE'
        });
        setLocationError(true);
      }
    };

    getWeatherWithLocation();

    // Update every 10 minutes
    const interval = setInterval(getWeatherWithLocation, 600000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="glass-widget shape-cut weather-widget"
      style={{ ...style, minWidth: '160px' }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="widget-header" onPointerDown={onPointerDown}>
        <span className="widget-title">ATMOSPHERE</span>
      </div>
      <div className="widget-content" style={{ padding: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#00ffe1' }}>{weather.temp}</div>
          <div
            style={{
              fontSize: '0.55rem',
              color: locationError ? 'rgba(255,100,100,0.7)' : 'rgba(255,255,255,0.5)',
              textAlign: 'right',
              marginBottom: '4px',
              maxWidth: '80px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            title={weather.location}
          >
            {weather.location}
          </div>
        </div>
        <div style={{ fontSize: '0.8rem', marginTop: '10px', letterSpacing: '1px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '1rem' }}>{getWeatherEmoji(weather.condition)}</span>
          <span>{weather.condition}</span>
        </div>
        <div style={{ fontSize: '0.6rem', color: 'rgba(0,255,225,0.7)', marginTop: '6px' }}>
          HUMIDITY: {weather.humidity}
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

export default WeatherWidget;
