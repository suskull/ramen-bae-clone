'use client';

import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

const stats: StatItem[] = [
  { value: 20, suffix: 'M+', label: 'Views' },
  { value: 120, suffix: 'K+', label: 'Fans' },
  { value: 300, suffix: 'K+', label: 'Customers' },
  { value: 7, suffix: 'x', label: 'Sold Out' },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: '0px 0px -100px 0px' });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest).toString() + suffix;
      }
    });
  }, [springValue, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export default function SocialProof() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -100px 0px' }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Loved by <span className="text-primary">Millions</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join the ramen revolution that's taking the world by storm
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -100px 0px' }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.1,
                ease: 'easeOut'
              }}
              className="text-center group"
            >
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="bg-linear-to-br from-pink-50 to-pink-100/50 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-200 ease-out"
                >
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-2">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm sm:text-base font-medium text-gray-700 uppercase tracking-wide">
                    {stat.label}
                  </div>
                </motion.div>
                
                {/* Decorative accent */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.1 + 0.3,
                    type: 'spring',
                    stiffness: 200
                  }}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-accent rounded-full opacity-80"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional social proof text */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '0px 0px -100px 0px' }}
          transition={{ duration: 0.3, delay: 0.8, ease: "easeOut" }}
          className="text-center mt-12 lg:mt-16"
        >
          <p className="text-gray-500 text-sm sm:text-base">
            Featured on social media, loved by food enthusiasts worldwide
          </p>
        </motion.div>
      </div>
    </section>
  );
}