import { useState, useEffect } from 'react';
import './Widgets.css';
import ResizeHandle from './ResizeHandle';

const QuickNotesWidget = ({ config, style, onPointerDown, onPointerMove, onPointerUp, onDelete, onResize }) => {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('junior-quick-notes');
    return saved || 'Click to add note...';
  });

  useEffect(() => {
    localStorage.setItem('junior-quick-notes', notes);
  }, [notes]);

  return (
    <div
      className="glass-widget shape-cut notes-widget"
      style={style}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="widget-header" onPointerDown={onPointerDown}>
        <span className="widget-title">QUICK NOTES</span>
      </div>
      <div className="widget-content notes-content">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Type your note here..."
          className="notes-textarea"
        />
      </div>
      <ResizeHandle 
        onResize={onResize} 
        width={config?.width} 
        height={config?.height} 
      />
    </div>
  );
};

export default QuickNotesWidget;
