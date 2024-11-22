import { useState, useRef, useEffect } from "react";

interface JoystickProps {
  position: number; // Position on the horizontal axis (-1 to 1)
  setPosition: (position: number) => void; // Function to update position
}

const Joystick1DH = ({ position, setPosition }: JoystickProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const maxRadius = centerX;
      const offsetX = e.clientX - rect.left - centerX;

      // Clamp the position between -1 and 1
      const clampedX = Math.max(-maxRadius, Math.min(offsetX, maxRadius)) / maxRadius;

      setPosition(clampedX);
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
      className="relative w-32 h-8 bg-gray-200 rounded-full flex items-center justify-center select-none"
      onMouseDown={handleMouseDown}
    >
      <div
        className="absolute w-8 h-8 bg-blue-500 rounded-full"
        style={{
          transform: `translateX(${position * 50}px)`,
        }}
      ></div>
    </div>
  );
};

export default Joystick1DH;
