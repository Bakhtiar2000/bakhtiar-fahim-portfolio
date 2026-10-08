"use client";

import { motion, type HTMLMotionProps } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as const;

/** Fades and lifts content in once when it scrolls into view. */
export function Reveal({ delay = 0, y = 16, children, ...props }: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.5, ease, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Parent for staggered children; pair with <RevealItem>. */
export function RevealGroup({ stagger = 0.06, children, ...props }: HTMLMotionProps<"div"> & { stagger?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
