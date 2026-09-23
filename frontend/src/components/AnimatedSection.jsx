import { motion } from 'framer-motion';

/**
 * Reusable animated wrapper for sections
 * Use index to create staggered animations across multiple sections
 */
export const AnimatedSection = ({ children, index = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{
      delay: index * 0.1,
      duration: 0.4,
      type: 'spring',
      stiffness: 100,
      damping: 15
    }}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * Staggered animation wrapper for lists
 */
export const AnimatedList = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * Fade in animation for any element
 */
export const FadeIn = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.3 }}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * Slide up animation
 */
export const SlideUp = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, type: 'spring', stiffness: 100 }}
    className={className}
  >
    {children}
  </motion.div>
);