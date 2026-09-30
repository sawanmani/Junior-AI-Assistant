import { useRef } from 'react';
import './Widgets.css';

const ResizeHandle = ({ onResize, width, height }) => {
  const resizing = useRef(false);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const handlePointerDown = (e) => {
    e.stopPropagation();
    resizing.current = true;
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      w: width,
      h: height
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!resizing.current) return;
    const dx = e.clientX - resizeStart.current.x;
    const dy = e.clientY - resizeStart.current.y;
    onResize(resizeStart.current.w + dx, resizeStart.current.h + dy);
  };

  const handlePointerUp = (e) => {
    resizing.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      className="widget-resizer"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  );
};

export default ResizeHandle;
