import { useState, useRef, useEffect, RefObject } from 'react';

interface RotateGestureOptions {
  value?: number;
  onChange?: (rotation: number) => void;
}

interface RotateGestureState {
  rotation: number;
}

export function useRotateGesture(ref: RefObject<HTMLElement>, options: RotateGestureOptions = {}): RotateGestureState {
  const [internalRotation, setInternalRotation] = useState(0);

  const isControlled = options.value !== undefined;
  const rotation = isControlled ? options.value! : internalRotation;

  // Store rotation in a ref to access it in event handlers without dependency
  const rotationRef = useRef(rotation);
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
          let delta = currentAngle - initialAngleRef.current;

          // Normalize delta to be within -180 to 180 to handle wrap-around
          if (delta > 180) {
            delta -= 360;
          } else if (delta < -180) {
            delta += 360;
          }

          const newRotation = startRotationRef.current + delta;

          if (isControlled && options.onChange) {
            options.onChange(newRotation);
          } else if (!isControlled) {
            setInternalRotation(newRotation);
          }
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
  }, [ref, isControlled, options.onChange]);

  return { rotation };
}
