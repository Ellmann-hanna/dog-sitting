import React, { useState, useEffect, useRef } from 'react';

interface DraggableEyeProps {
  initialX: number;
  initialY: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const DraggableEye: React.FC<DraggableEyeProps> = ({ initialX, initialY, containerRef }) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Calculate new position relative to container
      let newX = e.clientX - containerRect.left - 20; // 20 is half size
      let newY = e.clientY - containerRect.top - 20;

      // Bounds
      newX = Math.max(0, Math.min(newX, containerRect.width - 40));
      newY = Math.max(0, Math.min(newY, containerRect.height - 40));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, containerRef]);

  return (
    <div
      ref={elementRef}
      onMouseDown={() => setIsDragging(true)}
      style={{
        left: position.x,
        top: position.y,
        boxShadow: '0 0 15px 5px rgba(255, 0, 0, 0.8), 0 0 30px 10px rgba(255, 0, 0, 0.6)',
      }}
      className="absolute w-10 h-10 bg-red-500 rounded-full cursor-move z-50 opacity-80 hover:opacity-100 transition-opacity"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-80 blur-[2px]" />
    </div>
  );
};
