import { motion } from 'framer-motion';

/**
 * PageTransition - Wraps a page with a smooth fade + slide-up animation.
 * Used for all route transitions.
 */
const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 },
  },
};

const PageTransition = ({ children }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ paddingTop: '72px' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
