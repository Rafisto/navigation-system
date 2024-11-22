import { useState, useRef, useEffect } from "react";

interface JoystickProps {
  position: number; // Position on the vertical axis (-1 to 1)
  setPosition: (position: number) => void; // Function to update position
}

const Joystick1DV = ({ position, setPosition }: JoystickProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerY = rect.height / 2;
      const maxRadius = centerY;
      const offsetY = e.clientY - rect.top - centerY;

      // Clamp the position between -1 and 1
      const clampedY = Math.max(-maxRadius, Math.min(offsetY, maxRadius)) / maxRadius;

      // Invert direction to match typical joystick controls
      setPosition(-clampedY);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setPosition(0); // Reset to center
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
  }, [isDragging, setPosition]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-8 h-32 bg-gray-200 rounded-full flex items-center justify-center select-none"
      onMouseDown={handleMouseDown}
    >
      <div
        className="absolute w-8 h-8 bg-blue-500 rounded-full"
        style={{
          transform: `translateY(${position * -50}px)`,
        }}
      ></div>
    </div>
  );
};

export default Joystick1DV;
