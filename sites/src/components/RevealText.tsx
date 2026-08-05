import { AnimatePresence, motion } from 'motion/react';

interface RevealTextProps {
  value: string;
  className?: string;
}

export function RevealText({ value, className }: RevealTextProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        className={className}
        style={{ display: 'block' }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}
