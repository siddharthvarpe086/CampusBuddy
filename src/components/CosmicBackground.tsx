import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

interface Shape {
  id: number;
  x: number;
  y: number;
  size: number;
  type: 'triangle' | 'diamond' | 'circle';
  delay: number;
}

export const CosmicBackground = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [stars, setStars] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particles
    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 6,
    }));

    // Generate floating shapes
    const newShapes: Shape[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 60 + 20,
      type: ['triangle', 'diamond', 'circle'][Math.floor(Math.random() * 3)] as 'triangle' | 'diamond' | 'circle',
      delay: Math.random() * 20,
    }));

    // Generate twinkling stars
    const newStars: Particle[] = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 3,
    }));

    setParticles(newParticles);
    setShapes(newShapes);
    setStars(newStars);
  }, []);

  const renderShape = (shape: Shape) => {
    const baseStyle = {
      left: `${shape.x}%`,
      top: `${shape.y}%`,
      width: `${shape.size}px`,
      height: `${shape.size}px`,
      animationDelay: `${shape.delay}s`,
    };

    switch (shape.type) {
      case 'triangle':
        return (
          <div
            key={shape.id}
            className="cosmic-shape"
            style={{
              ...baseStyle,
              width: 0,
              height: 0,
              borderLeft: `${shape.size / 2}px solid transparent`,
              borderRight: `${shape.size / 2}px solid transparent`,
              borderBottom: `${shape.size}px solid hsl(var(--cosmic-magenta) / 0.1)`,
            }}
          />
        );
      case 'diamond':
        return (
          <div
            key={shape.id}
            className="cosmic-shape"
            style={{
              ...baseStyle,
              background: `linear-gradient(45deg, hsl(var(--cosmic-blue) / 0.1), hsl(var(--cosmic-magenta) / 0.1))`,
              transform: 'rotate(45deg)',
            }}
          />
        );
      case 'circle':
        return (
          <div
            key={shape.id}
            className="cosmic-shape"
            style={{
              ...baseStyle,
              background: `radial-gradient(circle, hsl(var(--cosmic-blue) / 0.1), transparent)`,
              borderRadius: '50%',
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="cosmic-particles">
      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Geometric shapes */}
      {shapes.map(renderShape)}

      {/* Twinkling stars */}
      {stars.map((star) => (
        <div
          key={`star-${star.id}`}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* Nebula effects */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse 800px 600px at 20% 40%, hsl(var(--cosmic-magenta) / 0.1), transparent),
            radial-gradient(ellipse 600px 800px at 80% 70%, hsl(var(--cosmic-blue) / 0.1), transparent),
            radial-gradient(ellipse 400px 400px at 50% 20%, hsl(var(--starlight-glow) / 0.05), transparent)
          `
        }}
      />
    </div>
  );
};