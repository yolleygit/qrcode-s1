'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02
  }
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'anticipate' as const,
  duration: 0.4
};

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// 淡入动画组件
export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.6,
  className = '' 
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration,
        delay,
        ease: [0.25, 0.25, 0, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// 滑入动画组件
export function SlideIn({ 
  children, 
  direction = 'up',
  delay = 0,
  duration = 0.5,
  className = '' 
}: {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const directionVariants = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: 50 },
    right: { x: -50 }
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        ...directionVariants[direction]
      }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      transition={{ 
        duration,
        delay,
        ease: [0.25, 0.25, 0, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// 缩放动画组件
export function ScaleIn({ 
  children, 
  delay = 0,
  duration = 0.5,
  className = '' 
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        scale: 0.8 
      }}
      animate={{ 
        opacity: 1, 
        scale: 1 
      }}
      transition={{ 
        duration,
        delay,
        ease: [0.25, 0.25, 0, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// 交错动画容器
export function StaggerContainer({ 
  children, 
  staggerDelay = 0.1,
  className = '' 
}: {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// 交错动画子项
export function StaggerItem({ 
  children, 
  className = '' 
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { 
          opacity: 0, 
          y: 20 
        },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.25, 0, 1]
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// 悬浮动画组件
export function FloatingElement({ 
  children, 
  intensity = 10,
  duration = 3,
  className = '' 
}: {
  children: ReactNode;
  intensity?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      animate={{
        y: [-intensity, intensity, -intensity],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// 脉冲动画组件
export function PulseElement({ 
  children, 
  scale = 1.05,
  duration = 2,
  className = '' 
}: {
  children: ReactNode;
  scale?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      animate={{
        scale: [1, scale, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// 路径绘制动画（用于SVG）
export function DrawPath({ 
  children, 
  duration = 2,
  delay = 0 
}: {
  children: ReactNode;
  duration?: number;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      <motion.svg
        variants={{
          hidden: { pathLength: 0 },
          visible: { 
            pathLength: 1,
            transition: { 
              duration,
              ease: "easeInOut"
            }
          }
        }}
      >
        {children}
      </motion.svg>
    </motion.div>
  );
}

// 打字机效果
export function TypewriterText({ 
  text, 
  delay = 0,
  speed = 0.05 
}: {
  text: string;
  delay?: number;
  speed?: number;
}) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: delay + index * speed,
            duration: 0
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}