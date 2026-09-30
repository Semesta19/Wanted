import React, { useRef, useState, useEffect, useCallback } from 'react';
import { InteractiveSettings } from '../types/poster';

interface Poster3DCardProps {
  children: React.ReactNode;
  settings: InteractiveSettings;
  className?: string;
}

export const Poster3DCard: React.FC<Poster3DCardProps> = ({
  children,
  settings,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Current rotation states
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const [glarePos, setGlarePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [isAutoOrbit, setIsAutoOrbit] = useState<boolean>(false);

  const { tiltEnabled, tiltIntensity, glareEnabled, glareOpacity } = settings;

  // Max tilt angle
  const maxTilt = 18 * (tiltIntensity || 1);

  // Mouse move handler
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!tiltEnabled || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const xRatio = (clientX / rect.width) * 2 - 1; // -1 to 1
      const yRatio = (clientY / rect.height) * 2 - 1; // -1 to 1

      setRotateY(xRatio * maxTilt);
      setRotateX(-yRatio * maxTilt);
      setGlarePos({
        x: (clientX / rect.width) * 100,
        y: (clientY / rect.height) * 100,
      });
      setIsInteracting(true);
      setIsAutoOrbit(false);
    },
    [tiltEnabled, maxTilt]
  );

  // Mouse leave handler
  const handleMouseLeave = useCallback(() => {
    setIsInteracting(false);
    if (!isAutoOrbit) {
      setRotateX(0);
      setRotateY(0);
      setGlarePos({ x: 50, y: 50 });
    }
  }, [isAutoOrbit]);

  // Touch move handler for mobile / tablet
  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!tiltEnabled || !containerRef.current || e.touches.length === 0) return;

      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = touch.clientX - rect.left;
      const clientY = touch.clientY - rect.top;

      const xRatio = Math.max(-1, Math.min(1, (clientX / rect.width) * 2 - 1));
      const yRatio = Math.max(-1, Math.min(1, (clientY / rect.height) * 2 - 1));

      setRotateY(xRatio * maxTilt);
      setRotateX(-yRatio * maxTilt);
      setGlarePos({
        x: (clientX / rect.width) * 100,
        y: (clientY / rect.height) * 100,
      });
      setIsInteracting(true);
      setIsAutoOrbit(false);
    },
    [tiltEnabled, maxTilt]
  );

  const handleTouchEnd = useCallback(() => {
    setIsInteracting(false);
    if (!isAutoOrbit) {
      setRotateX(0);
      setRotateY(0);
    }
  }, [isAutoOrbit]);

  // Gyroscope / DeviceOrientation handler for mobile devices
  useEffect(() => {
    if (!settings.gyroEnabled || !tiltEnabled) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      // Gamma is left-to-right tilt in degrees [-90, 90]
      // Beta is front-to-back tilt in degrees [-180, 180]
      const gamma = Math.max(-45, Math.min(45, e.gamma));
      const beta = Math.max(-45, Math.min(45, e.beta - 45)); // assume holding phone at ~45 deg

      const xRatio = gamma / 45;
      const yRatio = beta / 45;

      setRotateY(xRatio * maxTilt * 0.8);
      setRotateX(-yRatio * maxTilt * 0.8);
      setGlarePos({
        x: 50 + xRatio * 40,
        y: 50 + yRatio * 40,
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [settings.gyroEnabled, tiltEnabled, maxTilt]);

  // Gentle idle animation when not interacting
  useEffect(() => {
    if (!isAutoOrbit) return;

    let animId: number;
    let t = 0;
    const loop = () => {
      t += 0.025;
      setRotateY(Math.sin(t) * (maxTilt * 0.7));
      setRotateX(Math.cos(t * 0.7) * (maxTilt * 0.5));
      setGlarePos({
        x: 50 + Math.sin(t) * 35,
        y: 50 + Math.cos(t * 0.7) * 35,
      });
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isAutoOrbit, maxTilt]);

  // Dynamic shadow calculation
  const shadowX = -rotateY * 1.6;
  const shadowY = rotateX * 1.6 + 18;
  const shadowBlur = 38 + Math.abs(rotateX) + Math.abs(rotateY);

  return (
    <div
      className={`relative flex items-center justify-center p-4 sm:p-8 select-none ${className}`}
      style={{ perspective: '1100px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={containerRef}
        className="relative transition-transform preserve-3d"
        style={{
          transform: tiltEnabled
            ? `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1, 1, 1)`
            : 'none',
          transition: isInteracting ? 'transform 0.07s cubic-bezier(0.2, 0, 0.4, 1)' : 'transform 0.5s ease-out',
          filter: `drop-shadow(${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px ${shadowBlur.toFixed(1)}px rgba(0, 0, 0, 0.55))`,
        }}
      >
        {/* Child Poster */}
        {children}

        {/* Dynamic Glare / Light Reflection Sheen */}
        {glareEnabled && tiltEnabled && (
          <div
            className="absolute inset-0 rounded-sm pointer-events-none transition-opacity duration-300 overflow-hidden mix-blend-overlay"
            style={{
              opacity: isInteracting || isAutoOrbit ? glareOpacity : glareOpacity * 0.35,
              background: `radial-gradient(circle 500px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0) 70%)`,
              transform: 'translateZ(35px)',
            }}
          />
        )}
      </div>
    </div>
  );
};
