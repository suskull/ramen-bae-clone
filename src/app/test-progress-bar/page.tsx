'use client';

import { useState } from 'react';
import { ProgressBar } from '@/components/cart/ProgressBar';
import { Gift } from '@/stores/cart-store';

const GIFT_THRESHOLDS: Gift[] = [
  { id: 'free-shipping', name: 'Free Shipping', threshold: 40, unlocked: false },
  { id: 'free-fish-cakes', name: 'Free Fish Cakes', threshold: 60, unlocked: false },
];

export default function TestProgressBarPage() {
  const [subtotal, setSubtotal] = useState(0);

  // Calculate unlocked gifts based on subtotal
  const gifts = GIFT_THRESHOLDS.map((gift) => ({
    ...gift,
    unlocked: subtotal >= gift.threshold,
  }));

  const presetAmounts = [
    { label: 'Empty Cart ($0)', value: 0 },
    { label: 'Halfway to Shipping ($20)', value: 20 },
    { label: 'Almost Shipping ($35)', value: 35 },
    { label: 'Free Shipping Unlocked ($40)', value: 40 },
    { label: 'Between Thresholds ($50)', value: 50 },
    { label: 'Almost Fish Cakes ($55)', value: 55 },
    { label: 'Both Unlocked ($60)', value: 60 },
    { label: 'Over Both ($75)', value: 75 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ProgressBar Component Test
          </h1>
          <p className="mt-2 text-gray-600">
            Test the cart progress bar with different subtotal amounts
          </p>
        </div>

        {/* Manual Input */}
        <div className="rounded-lg bg-white p-6 shadow">
          <label className="block text-sm font-medium text-gray-700">
            Cart Subtotal: ${subtotal.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={subtotal}
            onChange={(e) => setSubtotal(Number(e.target.value))}
            className="mt-2 w-full"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={subtotal}
            onChange={(e) => setSubtotal(Number(e.target.value))}
            className="mt-2 w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

        {/* Preset Amounts */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Quick Test Amounts
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {presetAmounts.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setSubtotal(preset.value)}
                className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* ProgressBar Component */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Progress Bar Preview
          </h2>
          <ProgressBar subtotal={subtotal} gifts={gifts} />
        </div>

        {/* Status Info */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Current Status
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Free Shipping ($40):</span>
              <span
                className={
                  subtotal >= 40
                    ? 'font-semibold text-accent'
                    : 'text-gray-400'
                }
              >
                {subtotal >= 40 ? '✓ Unlocked' : '✗ Locked'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Free Fish Cakes ($60):</span>
              <span
                className={
                  subtotal >= 60
                    ? 'font-semibold text-accent'
                    : 'text-gray-400'
                }
              >
                {subtotal >= 60 ? '✓ Unlocked' : '✗ Locked'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
