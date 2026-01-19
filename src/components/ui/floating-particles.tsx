import React from 'react';
import { motion } from 'framer-motion';

interface FloatingParticlesProps {
  count?: number;
  colors?: string[];
  className?: string;
}

const FloatingParticles: React.FC<FloatingParticlesProps> = ({ 
  count = 6, 
  colors = ['bg-blue-400/20', 'bg-indigo-400/30', 'bg-purple-400/25', 'bg-pink-400/20'],
  className = ''
}) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1, // 1-4px
    color: colors[Math.floor(Math.random() * colors.length)],
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    duration: Math.random() * 3 + 3, // 3-6 seconds
    delay: Math.random() * 2,
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${particle.color}`}
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.initialX}%`,
            top: `${particle.initialY}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;