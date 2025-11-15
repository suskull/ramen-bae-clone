'use client';

import { Gift } from '@/stores/cart-store';

interface ProgressBarProps {
  subtotal: number;
  gifts: Gift[];
}

export function ProgressBar({ subtotal, gifts }: ProgressBarProps) {
  // Find the shipping and fish cakes gifts
  const freeShipping = gifts.find((g) => g.id === 'free-shipping');
  const freeFishCakes = gifts.find((g) => g.id === 'free-fish-cakes');

  if (!freeShipping || !freeFishCakes) {
    return null;
  }

  // Calculate progress percentage (based on the highest threshold)
  const maxThreshold = freeFishCakes.threshold;
  const progressPercentage = Math.min((subtotal / maxThreshold) * 100, 100);

  // Calculate how much more is needed for the next unlock
  const amountToShipping = Math.max(0, freeShipping.threshold - subtotal);
  const amountToFishCakes = Math.max(0, freeFishCakes.threshold - subtotal);

  // Determine the message to display
  let message = '';
  let messageColor = 'text-gray-600';

  if (freeFishCakes.unlocked) {
    message = '🎉 Free Shipping & Free Fish Cakes Unlocked!';
    messageColor = 'text-accent font-semibold';
  } else if (freeShipping.unlocked) {
    message = `🚚 Free Shipping Unlocked! Add $${amountToFishCakes.toFixed(2)} more for Free Fish Cakes`;
    messageColor = 'text-accent font-semibold';
  } else {
    message = `Add $${amountToShipping.toFixed(2)} more for Free Shipping`;
    messageColor = 'text-gray-600';
  }

  return (
    <div className="w-full space-y-2 py-4">
      {/* Progress Bar */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200">
        {/* Progress Fill */}
        <div
          className="h-full bg-linear-to-r from-primary to-primary-light transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
        
        {/* Threshold Markers */}
        <div
          className="absolute top-0 h-full w-0.5 bg-white"
          style={{ left: `${(freeShipping.threshold / maxThreshold) * 100}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-white"
          style={{ left: `${(freeFishCakes.threshold / maxThreshold) * 100}%` }}
        />
      </div>

      {/* Message */}
      <p className={`text-sm text-center transition-colors duration-200 ${messageColor}`}>
        {message}
      </p>

      {/* Unlocked Badges */}
      {(freeShipping.unlocked || freeFishCakes.unlocked) && (
        <div className="flex flex-wrap gap-2 justify-center">
          {freeShipping.unlocked && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent animate-in fade-in duration-200">
              ✓ Free Shipping
            </span>
          )}
          {freeFishCakes.unlocked && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent animate-in fade-in duration-200">
              ✓ Free Fish Cakes
            </span>
          )}
        </div>
      )}
    </div>
  );
}
