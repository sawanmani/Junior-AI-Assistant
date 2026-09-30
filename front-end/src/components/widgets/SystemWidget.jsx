import { useState } from 'react';
import './Widgets.css';
import ResizeHandle from './ResizeHandle';

const SystemWidget = ({ config, style, onPointerDown, onPointerMove, onPointerUp, onResize }) => {
  const systemInfo = {
    platform: navigator.platform,
    cores: navigator.hardwareConcurrency || '--',
    language: navigator.language,
    browser: navigator.userAgent.split(' ').pop()?.split('/')[0] || 'Unknown'
  };

  return (
    <div
      className="glass-widget shape-cut system-widget"
      style={style}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="widget-header" onPointerDown={onPointerDown}>
        <span className="widget-title">💻 SYSTEM INFO</span>
      </div>
      <div className="widget-content system-content">
        <div className="system-row">
          <span className="system-label">Platform</span>
          <span className="system-value cpu">{systemInfo.platform.includes('Win') ? 'Windows' : systemInfo.platform.includes('Mac') ? 'macOS' : systemInfo.platform.includes('Linux') ? 'Linux' : systemInfo.platform}</span>
        </div>
        <div className="system-row">
          <span className="system-label">CPU Cores</span>
          <span className="system-value memory">{systemInfo.cores} Threads</span>
        </div>
        <div className="system-row">
          <span className="system-label">Browser</span>
          <span className="system-value battery">{systemInfo.browser}</span>
        </div>
        <div className="system-row">
          <span className="system-label">Language</span>
          <span className="system-value network">{systemInfo.language}</span>
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

export default SystemWidget;
