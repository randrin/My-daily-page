import { animate, useMotionValue } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Custom hook for animating number countdowns
 * @param targetValue - The target number to animate to
 * @param duration - Animation duration in seconds (default: 0.8)
 * @returns The current animated count value
 */
export const useCountdown = (targetValue: number, duration = 0.8) => {
  const motionValue = useMotionValue(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controls = animate(motionValue, targetValue, {
      duration,
      ease: 'easeOut',
    });
    return () => controls.stop();
  }, [targetValue, motionValue, duration]);

  useEffect(() => {
    const unsubscribe = motionValue.on('change', (latest) => {
      setCount(Math.round(latest));
    });
    return () => unsubscribe();
  }, [motionValue]);

  return count;
};







