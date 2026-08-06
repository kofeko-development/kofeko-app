'use client';

import React, { useState, useEffect } from 'react';

const phrases = [
  'Better Shortlists',
  'Faster Hiring',
  'Fewer Interviews',
  'Confident Decisions',
];

export default function RotatingText() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReduceMotion(media.matches);

    updatePreference();
    media.addEventListener('change', updatePreference);
    return () => media.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    let transitionTimeout: number | undefined;
    const interval = setInterval(() => {
      setIsVisible(false);
      transitionTimeout = window.setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % phrases.length);
        setIsVisible(true);
      }, 300);
    }, 3000);

    return () => {
      clearInterval(interval);
      if (transitionTimeout) window.clearTimeout(transitionTimeout);
    };
  }, [reduceMotion]);

  return (
    <span
      className="inline-block min-h-[2.5em] text-primary transition-all duration-300 ease-in-out sm:min-h-[1.25em]"
      style={{
        opacity: reduceMotion || isVisible ? 1 : 0,
        transform: reduceMotion || isVisible ? 'translateY(0)' : 'translateY(8px)',
      }}
    >
      {phrases[currentIndex]}
    </span>
  );
}
