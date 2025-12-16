import { useState, useCallback, useRef, useEffect } from 'react';

export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface GestureState {
  isActive: boolean;
  startPoint: TouchPoint | null;
  currentPoint: TouchPoint | null;
  velocity: { x: number; y: number };
  distance: number;
  direction: 'up' | 'down' | 'left' | 'right' | null;
  duration: number;
}

export interface GestureConfig {
  minSwipeDistance: number;
  maxSwipeTime: number;
  minVelocity: number;
  preventScroll: boolean;
}

const DEFAULT_CONFIG: GestureConfig = {
  minSwipeDistance: 50,
  maxSwipeTime: 500,
  minVelocity: 0.3,
  preventScroll: false
};

export interface GestureCallbacks {
  onSwipeUp?: (gesture: GestureState) => void;
  onSwipeDown?: (gesture: GestureState) => void;
  onSwipeLeft?: (gesture: GestureState) => void;
  onSwipeRight?: (gesture: GestureState) => void;
  onTap?: (point: TouchPoint) => void;
  onLongPress?: (point: TouchPoint) => void;
  onPinch?: (scale: number, center: TouchPoint) => void;
  onGestureStart?: (gesture: GestureState) => void;
  onGestureEnd?: (gesture: GestureState) => void;
}

export function useMobileGestures(
  callbacks: GestureCallbacks = {},
  config: Partial<GestureConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const [gestureState, setGestureState] = useState<GestureState>({
    isActive: false,
    startPoint: null,
    currentPoint: null,
    velocity: { x: 0, y: 0 },
    distance: 0,
    direction: null,
    duration: 0
  });

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const touchHistory = useRef<TouchPoint[]>([]);
  const initialTouches = useRef<React.TouchList | null>(null);

  // Calculate velocity based on touch history
  const calculateVelocity = useCallback((currentPoint: TouchPoint): { x: number; y: number } => {
    const history = touchHistory.current;
    if (history.length < 2) return { x: 0, y: 0 };

    const recent = history.slice(-3); // Use last 3 points for smoother velocity
    const timeSpan = currentPoint.timestamp - recent[0].timestamp;
    
    if (timeSpan === 0) return { x: 0, y: 0 };

    const deltaX = currentPoint.x - recent[0].x;
    const deltaY = currentPoint.y - recent[0].y;

    return {
      x: deltaX / timeSpan,
      y: deltaY / timeSpan
    };
  }, []);

  // Calculate distance between two points
  const calculateDistance = useCallback((point1: TouchPoint, point2: TouchPoint): number => {
    const deltaX = point2.x - point1.x;
    const deltaY = point2.y - point1.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }, []);

  // Determine swipe direction
  const getSwipeDirection = useCallback((start: TouchPoint, end: TouchPoint): 'up' | 'down' | 'left' | 'right' | null => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Check if movement is significant enough
    if (Math.max(absDeltaX, absDeltaY) < finalConfig.minSwipeDistance) {
      return null;
    }

    // Determine primary direction
    if (absDeltaX > absDeltaY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, [finalConfig.minSwipeDistance]);

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const point: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };

    initialTouches.current = e.touches;
    touchHistory.current = [point];

    const newGestureState: GestureState = {
      isActive: true,
      startPoint: point,
      currentPoint: point,
      velocity: { x: 0, y: 0 },
      distance: 0,
      direction: null,
      duration: 0
    };

    setGestureState(newGestureState);
    callbacks.onGestureStart?.(newGestureState);

    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      callbacks.onLongPress?.(point);
    }, 500);

    // Prevent scroll if configured
    if (finalConfig.preventScroll) {
      e.preventDefault();
    }
  }, [callbacks, finalConfig.preventScroll]);

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!gestureState.isActive || !gestureState.startPoint) return;

    const touch = e.touches[0];
    const currentPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };

    // Add to history
    touchHistory.current.push(currentPoint);
    
    // Keep only recent history for performance
    if (touchHistory.current.length > 10) {
      touchHistory.current = touchHistory.current.slice(-10);
    }

    const velocity = calculateVelocity(currentPoint);
    const distance = calculateDistance(gestureState.startPoint, currentPoint);
    const direction = getSwipeDirection(gestureState.startPoint, currentPoint);
    const duration = currentPoint.timestamp - gestureState.startPoint.timestamp;

    const newGestureState: GestureState = {
      ...gestureState,
      currentPoint,
      velocity,
      distance,
      direction,
      duration
    };

    setGestureState(newGestureState);

    // Clear long press timer on movement
    if (longPressTimer.current && distance > 10) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Handle pinch gesture for multi-touch
    if (e.touches.length === 2 && initialTouches.current && initialTouches.current.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const initialTouch1 = initialTouches.current[0];
      const initialTouch2 = initialTouches.current[1];

      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const initialDistance = Math.sqrt(
        Math.pow(initialTouch2.clientX - initialTouch1.clientX, 2) + 
        Math.pow(initialTouch2.clientY - initialTouch1.clientY, 2)
      );

      const scale = currentDistance / initialDistance;
      const center: TouchPoint = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
        timestamp: Date.now()
      };

      callbacks.onPinch?.(scale, center);
    }

    // Prevent scroll if configured
    if (finalConfig.preventScroll) {
      e.preventDefault();
    }
  }, [gestureState, calculateVelocity, calculateDistance, getSwipeDirection, callbacks, finalConfig.preventScroll]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!gestureState.isActive || !gestureState.startPoint || !gestureState.currentPoint) return;

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    const finalGestureState: GestureState = {
      ...gestureState,
      isActive: false
    };

    setGestureState(finalGestureState);
    callbacks.onGestureEnd?.(finalGestureState);

    // Check for tap (short duration, small distance)
    if (finalGestureState.duration < 200 && finalGestureState.distance < 10 && finalGestureState.startPoint) {
      callbacks.onTap?.(finalGestureState.startPoint);
      return;
    }

    // Check for swipe
    const { direction, distance, duration, velocity } = finalGestureState;
    
    if (
      direction && 
      distance >= finalConfig.minSwipeDistance &&
      duration <= finalConfig.maxSwipeTime &&
      (Math.abs(velocity.x) >= finalConfig.minVelocity || Math.abs(velocity.y) >= finalConfig.minVelocity)
    ) {
      switch (direction) {
        case 'up':
          callbacks.onSwipeUp?.(finalGestureState);
          break;
        case 'down':
          callbacks.onSwipeDown?.(finalGestureState);
          break;
        case 'left':
          callbacks.onSwipeLeft?.(finalGestureState);
          break;
        case 'right':
          callbacks.onSwipeRight?.(finalGestureState);
          break;
      }
    }

    // Reset touch history
    touchHistory.current = [];
    initialTouches.current = null;
  }, [gestureState, callbacks, finalConfig]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  return {
    gestureState,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
}

// Utility hook for simple swipe detection
export function useSwipeGestures(callbacks: {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}) {
  const { touchHandlers } = useMobileGestures({
    onSwipeUp: callbacks.onSwipeUp,
    onSwipeDown: callbacks.onSwipeDown,
    onSwipeLeft: callbacks.onSwipeLeft,
    onSwipeRight: callbacks.onSwipeRight
  });

  return touchHandlers;
}

// Utility hook for tap and long press
export function useTapGestures(callbacks: {
  onTap?: () => void;
  onLongPress?: () => void;
}) {
  const { touchHandlers } = useMobileGestures({
    onTap: callbacks.onTap,
    onLongPress: callbacks.onLongPress
  });

  return touchHandlers;
}