import { useState } from 'react';
import './SettingsPanel.css';

const SettingsPanel = ({ isOpen, onClose, blobColors, onColorChange, widgets, onWidgetUpdate, widgetsLocked, onLockToggle }) => {
  const colorFields = [
    { key: 'colorDeep', label: 'Deep Color', desc: 'Core / darkest tone' },
    { key: 'colorMid', label: 'Mid Color', desc: 'Middle glow layer' },
    { key: 'colorBright', label: 'Bright Color', desc: 'Highlight / brightest tone' },
    { key: 'shellColor', label: 'Shell Color', desc: 'Outer shell glow' },
  ];

  return (
    <div className={`settings-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div
        className={`settings-panel ${isOpen ? 'open' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-header">
          <h3 className="settings-title">BLOB SETTINGS</h3>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>

        <div className="settings-body">
          <p className="settings-section-label">COLOR CONFIGURATION</p>

          {colorFields.map(({ key, label, desc }) => (
            <div className="color-field" key={key}>
              <div className="color-info">
                <span className="color-label">{label}</span>
                <span className="color-desc">{desc}</span>
              </div>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={blobColors[key]}
                  onChange={(e) => onColorChange(key, e.target.value)}
                  className="color-input"
                />
                <span className="color-hex">{blobColors[key]}</span>
              </div>
            </div>
          ))}

          <p className="settings-section-label" style={{ marginTop: '2rem' }}>ACTIVE WIDGETS</p>

          {Object.entries(widgets).map(([id, config]) => (
            <div className="color-field" key={id}>
              <div className="color-info">
                <span className="color-label" style={{ textTransform: 'capitalize' }}>
                  {id === 'time' ? 'Temporal Core (Time)' :
                    id === 'terminal' ? 'Speech Terminal' :
                      id === 'blob' ? 'AI Blob' :
                        id === 'system' ? 'System Monitor' :
                          id === 'notes' ? 'Quick Notes' :
                            id === 'juniorMusic' ? 'J.U.N.I.O.R. Music Player' : id}
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.visible}
                onChange={(e) => onWidgetUpdate(id, { visible: e.target.checked })}
                style={{ cursor: 'pointer', width: '20px', height: '20px' }}
              />
            </div>
          ))}

          <p className="settings-section-label" style={{ marginTop: '2rem' }}>TERMINAL CONFIG</p>

          <div className="color-field">
            <div className="color-info">
              <span className="color-label">Shape</span>
            </div>
            <select
              style={{ background: 'transparent', color: '#216a7eff', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '4px' }}
              value={widgets.terminal.shape}
              onChange={(e) => onWidgetUpdate('terminal', { shape: e.target.value })}
            >
              <option value="cut">Futuristic Cut</option>
              <option value="rounded">Rounded</option>
              <option value="square">Square</option>
            </select>
          </div>

          <div className="color-field">
            <div className="color-info">
              <span className="color-label">Language</span>
            </div>
            <select
              style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '4px' }}
              value={widgets.terminal.language}
              onChange={(e) => onWidgetUpdate('terminal', { language: e.target.value })}
            >
              <option value="hi-IN">Hindi (India)</option>
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
            </select>
          </div>

          <div className="color-field">
            <div className="color-info">
              <span className="color-label">Width</span>
            </div>
            <input
              type="range"
              min="100"
              max="1000"
              value={widgets.terminal.width}
              onChange={(e) => onWidgetUpdate('terminal', { width: parseInt(e.target.value) })}
            />
          </div>

          <div className="color-field">
            <div className="color-info">
              <span className="color-label">Height</span>
            </div>
            <input
              type="range"
              min="60"
              max="800"
              value={widgets.terminal.height}
              onChange={(e) => onWidgetUpdate('terminal', { height: parseInt(e.target.value) })}
            />
          </div>

          <p className="settings-section-label" style={{ marginTop: '2rem' }}>WIDGET CONTROLS</p>

          <div className="color-field">
            <div className="color-info">
              <span className="color-label">Lock Widgets</span>
              <span className="color-desc">Disable dragging for all widgets</span>
            </div>
            <input
              type="checkbox"
              checked={widgetsLocked}
              onChange={onLockToggle}
              style={{ cursor: 'pointer', width: '20px', height: '20px' }}
            />
          </div>

          <button
            style={{
              marginTop: '1rem',
              width: '100%',
              padding: '10px',
              background: 'rgba(0,255,225,0.1)',
              border: '1px solid rgba(0,255,225,0.3)',
              color: '#00ffe1',
              fontFamily: 'Orbitron',
              fontSize: '10px',
              cursor: 'pointer'
            }}
            onClick={() => {
              const defaults = {
                terminal: { x: 70, y: 70, width: 450, height: 200 },
                blob: { x: 50, y: 50 },
                dateTime: { x: 80, y: 15 },
                weather: { x: 30, y: 55 },
                status: { x: 10, y: 30 },
              };
              Object.keys(widgets).forEach(id => {
                onWidgetUpdate(id, { x: defaults[id].x, y: defaults[id].y });
              });
            }}
          >
            RESET POSITIONS
          </button>
        </div>

        <div className="settings-footer">
          <p className="settings-hint">
            Drag the widgets to move them. Settings are saved automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
