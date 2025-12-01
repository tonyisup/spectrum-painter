import { useState, useRef, useEffect, RefObject } from 'react';

interface RotateGestureState {
  rotation: number;
}

export function useRotateGesture(ref: RefObject<HTMLElement>): RotateGestureState {
  const [rotation, setRotation] = useState(0);

  // Store rotation in a ref to access it in event handlers without dependency
  const rotationRef = useRef(0);
  rotationRef.current = rotation;

  const initialAngleRef = useRef<number | null>(null);
  const startRotationRef = useRef<number>(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const getAngle = (touches: TouchList) => {
      if (touches.length < 2) return null;
      const t1 = touches[0];
      const t2 = touches[1];
      return Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const angle = getAngle(e.touches);
        if (angle !== null) {
          initialAngleRef.current = angle;
          // Use the ref value to avoid closure staleness without re-binding
          startRotationRef.current = rotationRef.current;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialAngleRef.current !== null) {
        if (e.cancelable) {
           e.preventDefault();
        }

        const currentAngle = getAngle(e.touches);
        if (currentAngle !== null) {
          const delta = currentAngle - initialAngleRef.current;
          setRotation(startRotationRef.current + delta);
        }
      }
    };

    const handleTouchEnd = () => {
      initialAngleRef.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [ref]);

  return { rotation };
}
