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
  isHovered?: boolean;
  isHighlighted?: boolean;
  color?: string; // 新增：自定义高亮颜色
  hideMargin?: boolean;
  fontClass?: string; // 新增：字体类名
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const FisheyeWord: React.FC<FisheyeWordProps> = ({ 
  word, 
  index,
  hoveredIndex,
  isHovered: externalHovered,
  isHighlighted, 
  color: highlightColor = '#E2B933',
  hideMargin = false,
  fontClass,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const isHovered = externalHovered || hoveredIndex === index;
  // 只有当是高亮词汇或者是高亮词组的一部分时，才允许放大和位移
  const shouldScale = isHighlighted || externalHovered;

  // 基础字号微调为 22px，提供更好的课堂视觉可见度
  const baseSize = 22;
  const scale = (isHovered && shouldScale) ? (baseSize + 8) / baseSize : 1;

  return (
    <motion.span
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      initial={false}
      animate={{ 
        // 进一步增加挤开空间，给放大后的文字留出足够视觉间隙
        marginLeft: hideMargin ? 0 : (isHovered && shouldScale ? 16 : 4),
        marginRight: hideMargin ? 0 : (isHovered && shouldScale ? 16 : 4),
        color: isHovered ? highlightColor : 'inherit'
      }}
      transition={{ 
        type: 'spring', damping: 25, stiffness: 200,
        color: { duration: 0.15 } // 颜色变化需要更迅速，不跟随弹簧效果
      }}
      className={cn(
        "cursor-pointer inline-block origin-center select-none relative px-1",
        "text-[22px] leading-relaxed transition-colors duration-500",
        fontClass, // 显式应用传入的字体
        isHighlighted && "font-bold",
        isHovered && "z-50",
      )}
      style={{
        // 移除内部背景，改由 ReaderEngine 统一管理，防止颜色重叠
        // backgroundImage: isHighlighted ? `linear-gradient(to bottom, transparent 50%, ${highlightColor}4D 50%)` : 'none',
      }}
    >
      <motion.span
        className="inline-block origin-center"
        animate={{ scale: scale }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {word}
      </motion.span>
    </motion.span>
  );
};
