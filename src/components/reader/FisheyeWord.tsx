import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FisheyeWordProps {
  word: string;
  index: number;
  hoveredIndex: number | null;
  isHighlighted?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const FisheyeWord: React.FC<FisheyeWordProps> = ({ 
  word, 
  index,
  hoveredIndex,
  isHighlighted, 
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const isHovered = hoveredIndex === index;

  // 基础字号微调为 22px，提供更好的课堂视觉可见度
  const baseSize = 22;
  const scale = isHovered ? (baseSize + 6) / baseSize : 1;

  return (
    <motion.span
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      initial={false}
      animate={{ 
        scale: scale,
        // 配合 22px 字号微调间距
        marginLeft: isHovered ? 14 : 6,
        marginRight: isHovered ? 14 : 6,
        color: isHovered ? '#D4AF37' : '#1A1A1A'
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={cn(
        "cursor-pointer inline-block origin-center select-none",
        "text-[22px] font-serif leading-relaxed",
        isHighlighted && "marker-highlight font-bold",
      )}
    >
      {word}
    </motion.span>
  );
};
