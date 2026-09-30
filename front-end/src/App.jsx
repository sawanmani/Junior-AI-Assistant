import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import AIAssistantBlob from './components/blob.jsx';
import SettingsPanel from './components/SettingsPanel';
import About from './about/About.jsx';
// Widgets - All widget components
import DateTimeWidget from './components/widgets/DateTimeWidget.jsx';
import SpeechTerminal from './components/widgets/SpeechTerminal.jsx';
import TimeWidget from './components/widgets/TimeWidget.jsx';
import WeatherWidget from './components/widgets/WeatherWidget.jsx';
import StatusWidget from './components/widgets/StatusWidget.jsx';
import SystemWidget from './components/widgets/SystemWidget.jsx';
import QuickNotesWidget from './components/widgets/QuickNotesWidget.jsx';
import JuniorMusicPlayer from './components/widgets/JuniorMusicPlayer.jsx';

// Default widget positions (percentages)
const WIDGET_DEFAULTS = {
  terminal: { x: 70, y: 70, width: 450, height: 220, shape: 'cut', language: 'en-US', visible: true },
  blob: { x: 50, y: 55, visible: true },
  time: { x: 85, y: 18, width: 250, height: 140, visible: true },
  weather: { x: 30, y: 55, width: 200, height: 220, visible: true },
  status: { x: 10, y: 30, width: 240, height: 320, visible: true },
  system: { x: 15, y: 55, width: 220, height: 240, visible: true },
  notes: { x: 50, y: 75, width: 300, height: 200, visible: true },
  juniorMusic: { x: 85, y: 40, width: 320, height: 620, visible: true },
  dateTime: { x: 85, y: 10, width: 180, height: 100, visible: true },
};

// Mobile default positions
const MOBILE_DEFAULTS = {
  terminal: { x: 50, y: 88, width: 320, height: 140 },
  blob: { x: 50, y: 50 },
  time: { x: 50, y: 5, width: 200, height: 100 },
  weather: { x: 5, y: 50, width: 150, height: 180 },
  status: { x: 5, y: 70, width: 180, height: 200 },
  system: { x: 5, y: 15, width: 160, height: 180 },
  notes: { x: 50, y: 75, width: 280, height: 180 },
  juniorMusic: { x: 80, y: 35, width: 280, height: 450 },
  dateTime: { x: 50, y: 10, width: 140, height: 80 },
};

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [widgetsLocked, setWidgetsLocked] = useState(() => {
    return localStorage.getItem('junior-widgets-locked') === 'true';
  });
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  // Blob color configuration
  const [blobColors, setBlobColors] = useState({
    colorDeep: '#001433',
    colorMid: '#0084ff',
    colorBright: '#00ffe1',
    shellColor: '#0066ff',
  });

  // Floating particles for background animation
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate floating particles
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

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Centralized Widget State with Persistence
  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem('junior-widgets-config');
    const defaults = isMobile ? MOBILE_DEFAULTS : WIDGET_DEFAULTS;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with defaults, preserving saved positions but applying current viewport defaults for missing values
        const merged = {};
        for (const key of Object.keys(defaults)) {
          merged[key] = { ...defaults[key], ...parsed[key] };
        }
        return merged;
      } catch (e) {
        return defaults;
      }
    }
    return defaults;
  });

  // Update widget positions when switching between mobile/desktop
  useEffect(() => {
    const defaults = isMobile ? MOBILE_DEFAULTS : WIDGET_DEFAULTS;
    setWidgets(prev => {
      const updated = {};
      for (const key of Object.keys(prev)) {
        updated[key] = { ...defaults[key], ...prev[key] };
      }
      return updated;
    });
  }, [isMobile]);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('junior-widgets-config', JSON.stringify(widgets));
  }, [widgets]);

  useEffect(() => {
    localStorage.setItem('junior-widgets-locked', widgetsLocked);
  }, [widgetsLocked]);

  const updateWidget = useCallback((id, updates) => {
    setWidgets(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  }, []);

  // Dragging state
  const dragInfo = useRef({ id: null, offset: { x: 0, y: 0 } });

  // Responsive blob size
  const BLOB_SIZE = isMobile ? 280 : 400;

  const handleColorChange = (key, value) => {
    setBlobColors((prev) => ({ ...prev, [key]: value }));
  };

  // Unified Widget Drag handlers
  const handleWidgetPointerDown = useCallback((id, e) => {
    if (widgetsLocked) return;
    const widgetEl = e.currentTarget;
    const rect = widgetEl.getBoundingClientRect();

    dragInfo.current = {
      id,
      offset: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    };

    widgetEl.setPointerCapture(e.pointerId);
  }, [widgetsLocked]);

  const handleWidgetPointerMove = useCallback((e) => {
    const { id, offset } = dragInfo.current;
    if (!id) return;

    // Convert to percentage for responsiveness
    const xPercent = ((e.clientX - offset.x) / window.innerWidth) * 100;
    const yPercent = ((e.clientY - offset.y) / window.innerHeight) * 100;

    updateWidget(id, {
      x: Math.min(Math.max(0, xPercent), isMobile ? 95 : 90),
      y: Math.min(Math.max(0, yPercent), isMobile ? 90 : 90),
    });
  }, [updateWidget, isMobile]);

  const handleWidgetPointerUp = useCallback((e) => {
    dragInfo.current.id = null;
  }, []);

  const handleWidgetResize = useCallback((id, w, h) => {
    updateWidget(id, {
      width: Math.max(id === 'notes' ? 180 : 100, w),
      height: Math.max(id === 'notes' ? 120 : 60, h),
    });
  }, [updateWidget]);

  // Music player control ref for voice commands
  const musicPlayerApiRef = useRef(null);

  // Handle conversation updates from SpeechTerminal
  const handleConversationUpdate = useCallback((conversation) => {
    console.log('Conversation:', conversation);
    // You can add additional handling here if needed
  }, []);

  // Handle music play requests from voice assistant
  const handleMusicPlayRequest = useCallback((songName) => {
    console.log('[APP] Music play request received:', songName);
    console.log('[APP] Music player API ref:', musicPlayerApiRef.current);
    if (musicPlayerApiRef.current) {
      console.log('[APP] Calling playSong with:', songName);
      musicPlayerApiRef.current.playSong(songName);
    } else {
      console.error('[APP] Music player API ref is null!');
    }
  }, []);

  // Blob wrapper style
  const blobStyle = {
    position: 'fixed',
    top: `${widgets.blob.y}%`,
    left: `${widgets.blob.x}%`,
    width: `${BLOB_SIZE}px`,
    height: `${BLOB_SIZE}px`,
    cursor: widgetsLocked ? 'default' : 'grab',
    borderRadius: '50%',
    zIndex: 10,
    touchAction: 'none',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'auto',
  };

  // Calculate widget styles
  const getWidgetStyle = (id) => {
    const w = widgets[id];
    if (!w) return {};

    const posX = (w.x !== null && w.x !== undefined) ? w.x : WIDGET_DEFAULTS[id].x;
    const posY = (w.y !== null && w.y !== undefined) ? w.y : WIDGET_DEFAULTS[id].y;

    return {
      position: 'fixed',
      top: `${posY}%`,
      left: `${posX}%`,
      width: w.width ? `${w.width}px` : undefined,
      height: w.height ? `${w.height}px` : undefined,
      transform: id === 'terminal' ? 'translate(0, 0)' : 'translate(-50%, -50%)',
      pointerEvents: 'auto',
      zIndex: 10,
      maxWidth: isMobile ? 'calc(100vw - 20px)' : 'none',
    };
  };

  return (
    <div className="app-container">
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

      <Navbar
        isListening={isListening}
        onMicClick={() => setIsListening((l) => !l)}
        onSettingsClick={() => setSettingsOpen((o) => !o)}
        onAboutClick={() => setAboutOpen(true)}
      />

      {/* Draggable Blob */}
      <div
        className="blob-wrapper"
        style={blobStyle}
        onPointerDown={(e) => handleWidgetPointerDown('blob', e)}
        onPointerMove={handleWidgetPointerMove}
        onPointerUp={handleWidgetPointerUp}
      >
        <AIAssistantBlob
          width="100%"
          height="100%"
          config={blobColors}
          state={isListening ? 'listening' : 'idle'}
          style={{ borderRadius: '50%' }}
        />
      </div>

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        blobColors={blobColors}
        onColorChange={handleColorChange}
        widgets={widgets}
        onWidgetUpdate={updateWidget}
        widgetsLocked={widgetsLocked}
        onLockToggle={() => setWidgetsLocked(!widgetsLocked)}
      />

      {/* Futuristic Speech Terminal */}
      {widgets.terminal.visible && (
        <SpeechTerminal
          isListening={isListening}
          config={widgets.terminal}
          style={getWidgetStyle('terminal')}
          onPointerDown={(e) => handleWidgetPointerDown('terminal', e)}
          onPointerMove={handleWidgetPointerMove}
          onPointerUp={handleWidgetPointerUp}
          onResize={(w, h) => handleWidgetResize('terminal', w, h)}
          onConversationUpdate={handleConversationUpdate}
          onMusicPlayRequest={handleMusicPlayRequest}
        />
      )}

      {/* Persistence-aware Widgets */}
      {widgets.time.visible && (
        <TimeWidget
          config={widgets.time}
          style={getWidgetStyle('time')}
          onPointerDown={(e) => handleWidgetPointerDown('time', e)}
          onPointerMove={handleWidgetPointerMove}
          onPointerUp={handleWidgetPointerUp}
          onResize={(w, h) => handleWidgetResize('time', w, h)}
        />
      )}

      {widgets.weather.visible && (
        <WeatherWidget
          config={widgets.weather}
          style={getWidgetStyle('weather')}
          onPointerDown={(e) => handleWidgetPointerDown('weather', e)}
          onPointerMove={handleWidgetPointerMove}
          onPointerUp={handleWidgetPointerUp}
          onResize={(w, h) => handleWidgetResize('weather', w, h)}
        />
      )}

      {widgets.status.visible && (
        <StatusWidget
          config={widgets.status}
          style={getWidgetStyle('status')}
          onPointerDown={(e) => handleWidgetPointerDown('status', e)}
          onPointerMove={handleWidgetPointerMove}
          onPointerUp={handleWidgetPointerUp}
          onResize={(w, h) => handleWidgetResize('status', w, h)}
        />
      )}

      {widgets.system?.visible && (
        <SystemWidget
          config={widgets.system}
          style={getWidgetStyle('system')}
          onPointerDown={(e) => handleWidgetPointerDown('system', e)}
          onPointerMove={handleWidgetPointerMove}
          onPointerUp={handleWidgetPointerUp}
          onResize={(w, h) => handleWidgetResize('system', w, h)}
        />
      )}

      {widgets.notes?.visible && (
        <QuickNotesWidget
          config={widgets.notes}
          style={getWidgetStyle('notes')}
          onPointerDown={(e) => handleWidgetPointerDown('notes', e)}
          onPointerMove={handleWidgetPointerMove}
          onPointerUp={handleWidgetPointerUp}
          onResize={(w, h) => handleWidgetResize('notes', w, h)}
        />
      )}

      {widgets.juniorMusic?.visible && (
        <JuniorMusicPlayer
          config={widgets.juniorMusic}
          style={getWidgetStyle('juniorMusic')}
          onPointerDown={(e) => handleWidgetPointerDown('juniorMusic', e)}
          onPointerMove={handleWidgetPointerMove}
          onPointerUp={handleWidgetPointerUp}
          onResize={(w, h) => handleWidgetResize('juniorMusic', w, h)}
          onVoicePlayRequest={handleMusicPlayRequest}
          playerApiRef={musicPlayerApiRef}
        />
      )}

      {/* About Page Modal */}
      {aboutOpen && <About onClose={() => setAboutOpen(false)} />}
    </div>
  );
}

export default App;
