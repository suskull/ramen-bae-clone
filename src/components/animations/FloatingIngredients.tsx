'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface IngredientProps {
  emoji: string;
  size: number;
  initialX: number;
  initialY: number;
  duration: number;
  delay: number;
  floatDirection: 'up' | 'diagonal-left' | 'diagonal-right';
}

const Ingredient = ({ emoji, size, initialX, initialY, duration, delay, floatDirection }: IngredientProps) => {
  // Define different floating patterns
  const getFloatAnimation = () => {
    switch (floatDirection) {
      case 'diagonal-left':
        return {
          x: [-10, -30, -50, -70, -90],
          y: [-20, -40, -60, -80, -100],
        };
      case 'diagonal-right':
        return {
          x: [10, 30, 50, 70, 90],
          y: [-20, -40, -60, -80, -100],
        };
      default: // 'up'
        return {
          x: [0, 5, -5, 0, 0],
          y: [-20, -40, -60, -80, -100],
        };
    }
  };

  const floatAnimation = getFloatAnimation();

  return (
    <motion.div
      className="absolute pointer-events-none select-none will-change-transform"
      style={{
        fontSize: `${size}px`,
        left: `${initialX}%`,
        top: `${initialY}%`,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
      }}
      initial={{ 
        opacity: 0,
        scale: 0.8,
        rotate: 0,
      }}
      animate={{
        opacity: [0, 0.4, 0.7, 0.5, 0.3, 0],
        scale: [0.8, 1, 1.05, 1, 0.95, 0.8],
        rotate: [0, 8, -8, 5, -5, 0],
        ...floatAnimation,
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 4 + 3, // Random delay between 3-7 seconds
        ease: "easeOut",
      }}
    >
      {emoji}
    </motion.div>
  );
};

interface FloatingIngredientsProps {
  className?: string;
}

const FloatingIngredients = ({ className = '' }: FloatingIngredientsProps) => {
  // Ramen-related ingredient emojis
  const ingredients = [
    '🍜', // Ramen bowl
    '🥚', // Egg
    '🧄', // Garlic
    '🌶️', // Chili pepper
    '🧅', // Onion
    '🥬', // Leafy greens
    '🍄', // Mushroom
    '🌽', // Corn
    '🥕', // Carrot
    '🫑', // Bell pepper
    '🧈', // Butter
    '🌿', // Herbs
  ];

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Generate random positions and animations for ingredients
  const floatingIngredients = useMemo(() => {
    const directions: Array<'up' | 'diagonal-left' | 'diagonal-right'> = ['up', 'diagonal-left', 'diagonal-right'];
    
    return Array.from({ length: 15 }, (_, index) => {
      const ingredient = ingredients[index % ingredients.length];
      return {
        id: index,
        emoji: ingredient,
        size: Math.random() * 16 + 20, // Size between 20-36px
        initialX: Math.random() * 85 + 7.5, // X position between 7.5-92.5%
        initialY: Math.random() * 70 + 20, // Y position between 20-90%
        duration: Math.random() * 3 + 8, // Duration between 8-11 seconds
        delay: Math.random() * 12, // Delay between 0-12 seconds
        floatDirection: directions[Math.floor(Math.random() * directions.length)],
      };
    });
  }, []);

  

  // Don't render animations if user prefers reduced motion
  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      
      {floatingIngredients.map((ingredient) => (
        <Ingredient
          key={ingredient.id}
          emoji={ingredient.emoji}
          size={ingredient.size}
          initialX={ingredient.initialX}
          initialY={ingredient.initialY}
          duration={ingredient.duration}
          delay={ingredient.delay}
          floatDirection={ingredient.floatDirection}
        />
      ))}
    </div>
  );
};

export default FloatingIngredients;