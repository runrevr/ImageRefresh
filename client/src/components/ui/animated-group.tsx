'use client'

import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

export interface AnimatedGroupProps extends HTMLMotionProps<'div'> {
  variants?: any
  children: React.ReactNode
  className?: string
  childClassName?: string
}

export function AnimatedGroup({
  variants,
  children,
  className,
  childClassName,
  initial = 'hidden',
  animate = 'visible',
  ...props
}: AnimatedGroupProps) {
  return (
    <motion.div
      initial={initial}
      animate={animate}
      variants={variants?.container || variants}
      className={className}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child

        return (
          <motion.div
            variants={variants?.item || variants}
            className={childClassName}
          >
            {child}
          </motion.div>
        )
      })}
    </motion.div>
  )
}