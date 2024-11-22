import { useState, useRef, useEffect } from "react";

interface JoystickProps {
  position: { x: number; y: number };
  setPosition: (position: { x: number; y: number }) => void;
}

const Joystick = ({ position, setPosition }: JoystickProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const maxRadius = centerX; // Assuming square container
      const offsetX = e.clientX - rect.left - centerX;
      const offsetY = e.clientY - rect.top - centerY;

      // Calculate distance and constrain to the circle
      const distance = Math.sqrt(offsetX ** 2 + offsetY ** 2);
      const clampedDistance = Math.min(distance, maxRadius);
      const angle = Math.atan2(offsetY, offsetX);

      const newX = (clampedDistance * Math.cos(angle)) / maxRadius;
      const newY = (clampedDistance * Math.sin(angle)) / maxRadius;

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setPosition({ x: 0, y: 0 }); // Reset to center
      }
    };

    // Add global event listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      // Clean up event listeners
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center select-none"
      onMouseDown={handleMouseDown}
    >
      <div
        className="absolute w-8 h-8 bg-blue-500 rounded-full"
        style={{
          transform: `translate(${position.x * 50}px, ${position.y * 50}px)`,
        }}
      ></div>
    </div>
  );
};

export default Joystick;
