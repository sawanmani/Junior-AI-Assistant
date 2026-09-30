import { useState, useEffect } from 'react';
import './Widgets.css';
import ResizeHandle from './ResizeHandle';

const StatusWidget = ({ config, style, onPointerDown, onPointerMove, onPointerUp, onResize }) => {
  const [systemData, setSystemData] = useState({
    battery: { level: 100, charging: false },
    network: { online: navigator.onLine, downlink: '--', type: '--' },
    tabCount: 1,
    visibility: document.visibilityState
  });

  // Get battery info
  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        setSystemData(prev => ({
          ...prev,
          battery: {
            level: Math.round(battery.level * 100),
            charging: battery.charging
          }
        }));

        battery.addEventListener('levelchange', () => {
          setSystemData(prev => ({
            ...prev,
            battery: {
              level: Math.round(battery.level * 100),
              charging: battery.charging
            }
          }));
        });
      });
    }
  }, []);

  // Network connection info
  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection) {
      setSystemData(prev => ({
        ...prev,
        network: {
          online: navigator.onLine,
          downlink: connection.downlink ? `${connection.downlink} Mbps` : '--',
          type: connection.effectiveType || '--',
          rtt: connection.rtt || '--'
        }
      }));

      const handleChange = () => {
        setSystemData(prev => ({
          ...prev,
          network: {
            online: navigator.onLine,
            downlink: connection.downlink ? `${connection.downlink} Mbps` : '--',
            type: connection.effectiveType || '--',
            rtt: connection.rtt || '--'
          }
        }));
      };

      connection.addEventListener('change', handleChange);
      return () => connection.removeEventListener('change', handleChange);
    }
  }, []);

  // Tab visibility
  useEffect(() => {
    const handleVisibility = () => {
      setSystemData(prev => ({ ...prev, visibility: document.visibilityState }));
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return (
    <div
      className="glass-widget shape-cut status-widget"
      style={{ ...style, minWidth: '200px' }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="widget-header" onPointerDown={onPointerDown}>
        <span className="widget-title">⚡ DEVICE STATUS</span>
      </div>
      <div className="widget-content" style={{ padding: '12px 15px' }}>
        {/* Battery Status */}
        <div className="status-section">
          <div className="status-label">🔋 Battery</div>
          <div className="status-value-row">
            <span className="status-value" style={{ color: systemData.battery.level > 20 ? '#00ff88' : '#ff4444' }}>
              {systemData.battery.level}%
            </span>
            {systemData.battery.charging && (
              <span className="status-badge charging">⚡ Charging</span>
            )}
          </div>
          <div className="status-bar">
            <div
              className="status-bar-fill"
              style={{
                width: `${systemData.battery.level}%`,
                background: systemData.battery.level > 50 ? 'linear-gradient(90deg, #00ff88, #00ffe1)' :
                           systemData.battery.level > 20 ? 'linear-gradient(90deg, #ffaa00, #ffcc00)' :
                           'linear-gradient(90deg, #ff4444, #ff6666)'
              }}
            />
          </div>
        </div>

        {/* Network Connection */}
        <div className="status-section">
          <div className="status-label">🌐 Connection</div>
          <div className="status-value-row">
            <span className="status-value" style={{ color: systemData.network.online ? '#00ff88' : '#ff4444' }}>
              {systemData.network.online ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="status-grid" style={{ marginTop: '6px' }}>
            <div className="status-mini">
              <span className="status-mini-label">Speed</span>
              <span className="status-mini-value">{systemData.network.downlink}</span>
            </div>
            <div className="status-mini">
              <span className="status-mini-label">Type</span>
              <span className="status-mini-value" style={{ textTransform: 'capitalize' }}>{systemData.network.type}</span>
            </div>
          </div>
        </div>

        {/* Tab Status */}
        <div className="status-section" style={{ borderBottom: 'none' }}>
          <div className="status-label">📑 Tab Status</div>
          <div className="status-value-row">
            <span className="status-value" style={{ fontSize: '0.65rem' }}>
              {systemData.visibility === 'visible' ? '👁️ Active' : '😴 Background'}
            </span>
          </div>
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

export default StatusWidget;
