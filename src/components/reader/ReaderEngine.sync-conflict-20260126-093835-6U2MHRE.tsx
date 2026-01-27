import React, { useState } from 'react';
import { FisheyeWord } from './FisheyeWord';
import { motion } from 'framer-motion';
import { Vocabulary } from '../../api/db';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ReaderEngineProps {
  content: string;
  imageUrl?: string;
  imageData?: Blob;
  highlightedWords: Vocabulary[]; // 改为传递完整的词汇对象
  onWordClick?: (word: string) => void;
}

export const ReaderEngine: React.FC<ReaderEngineProps> = ({ 
  content, 
  imageUrl,
  imageData,
  highlightedWords,
  onWordClick 
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredVocabId, setHoveredVocabId] = useState<number | null>(null);
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (imageData) {
      const url = URL.createObjectURL(imageData);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setObjectUrl(null);
    }
  }, [imageData]);

  const displayImage = objectUrl || imageUrl;

  // 改进的分词逻辑：将标点符号合并到前面的单词中，避免标点符号单独换行
  const groups = React.useMemo(() => {
    const rawSegments = content.split(/(\s+|[.,!?;:()])/g).filter(Boolean);
    const result: any[] = [];
    
    for (let i = 0; i < rawSegments.length; i++) {
      const current = rawSegments[i];
      const next = rawSegments[i + 1];
      
      const isSpace = /^\s+$/.test(current);
      const isPunct = /^[.,!?;:()]$/.test(current);
      
      // 如果当前是单词，且下一个是标点符号，则将它们合并
      if (!isSpace && !isPunct && next && /^[.,!?;:()]$/.test(next)) {
        result.push({
          type: 'word-with-punct',
          word: current,
          punct: next,
          index: i
        });
        i++; // 跳过已合并的标点
      } else {
        result.push({
          type: isSpace ? 'space' : (isPunct ? 'punct' : 'word'),
          content: current,
          index: i
        });
      }
    }
    return result;
  }, [content]);

  // 计算每个 segment 对应的词汇映射，支持词组
  const segmentVocabMap = React.useMemo(() => {
    const map: Record<number, Vocabulary> = {};
    if (highlightedWords.length === 0) return map;

    // 按长度降序排列，优先匹配长词组
    const sortedVocabs = [...highlightedWords].sort((a, b) => b.word.length - a.word.length);

    sortedVocabs.forEach(vocab => {
      const patterns = [vocab.word, ...(vocab.matchPattern?.split(',').map(p => p.trim()) || [])]
        .filter(Boolean)
        .map(p => p.toLowerCase());

      patterns.forEach(pattern => {
        const patternWords = pattern.split(/\s+/);
        
        // 在 groups 中寻找匹配的单词序列
        for (let i = 0; i < groups.length; i++) {
          let groupIdx = i;
          let patternIdx = 0;
          const matchedIndices: number[] = [];

          while (patternIdx < patternWords.length && groupIdx < groups.length) {
            const group = groups[groupIdx];
            
            // 跳过空格和标点（除非标点是模式的一部分，但通常不是）
            if (group.type === 'space') {
              groupIdx++;
              continue;
            }

            const currentWord = (group.word || group.content || '').toLowerCase();
            if (currentWord === patternWords[patternIdx]) {
              matchedIndices.push(groupIdx);
              patternIdx++;
              groupIdx++;
            } else {
              break;
            }
          }

          if (patternIdx === patternWords.length) {
            // 找到完整匹配，标记所有相关索引（包括中间的空格/标点）
            const firstIdx = matchedIndices[0];
            const lastIdx = matchedIndices[matchedIndices.length - 1];
            for (let k = firstIdx; k <= lastIdx; k++) {
              if (!map[groups[k].index]) {
                map[groups[k].index] = vocab;
              }
            }
          }
        }
      });
    });

    return map;
  }, [groups, highlightedWords]);

  const renderedContent = React.useMemo(() => {
    const elements: React.ReactNode[] = [];
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      const vocab = segmentVocabMap[group.index];

      if (vocab) {
        // 找到整个词组的范围
        const phraseItems: any[] = [group];
        let j = i + 1;
        while (j < groups.length && segmentVocabMap[groups[j].index]?.id === vocab.id) {
          phraseItems.push(groups[j]);
          j++;
        }

        const isPhraseHovered = hoveredVocabId === vocab.id;

        elements.push(
          <motion.span
            key={`phrase-${vocab.id}-${group.index}`}
            className={cn(
              "inline cursor-pointer transition-all duration-300",
              isPhraseHovered && "z-20 relative"
            )}
            style={{
              backgroundImage: `linear-gradient(to bottom, transparent 50%, ${(vocab.color || '#E2B933')}4D 50%)`
            }}
            onMouseEnter={() => setHoveredVocabId(vocab.id!)}
            onMouseLeave={() => setHoveredVocabId(null)}
            onClick={() => onWordClick?.(vocab.word)}
          >
            {phraseItems.map((item) => {
              if (item.type === 'space') {
                return (
                  <motion.span 
                    key={item.index} 
                    className="inline-block"
                    animate={{ 
                      width: isPhraseHovered ? '0.8em' : '0.35em',
                      scale: isPhraseHovered ? 1.3 : 1 
                    }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  >
                    &nbsp;
                  </motion.span>
                );
              }

              if (item.type === 'punct') {
                return (
                  <span key={item.index} className="inline text-[22px] text-luxury-muted opacity-40 px-0.5 font-serif italic">
                    {item.content}
                  </span>
                );
              }

              const wordToMatch = item.word || item.content;
              return (
                <FisheyeWord
                  key={item.index}
                  index={item.index}
                  word={wordToMatch}
                  hoveredIndex={null}
                  isHovered={isPhraseHovered}
                  isHighlighted={false}
                  color={vocab.color}
                  hideMargin={true}
                />
              );
            })}
          </motion.span>
        );
        i = j - 1; // 跳过已处理的项目
      } else {
        // 非高亮内容
        if (group.type === 'space') {
          // 探测左右邻居是否正在被 Hover，且邻居必须是重点词汇（即会放大的词）
          const prevGroup = groups[i - 1];
          const nextGroup = groups[i + 1];
          
          const isPrevScaling = prevGroup && (
            (hoveredIndex === prevGroup.index && false) || // 普通词不放大
            (segmentVocabMap[prevGroup.index] && (hoveredIndex === prevGroup.index || hoveredVocabId === segmentVocabMap[prevGroup.index].id))
          );
          
          const isNextScaling = nextGroup && (
            (hoveredIndex === nextGroup.index && false) || // 普通词不放大
            (segmentVocabMap[nextGroup.index] && (hoveredIndex === nextGroup.index || hoveredVocabId === segmentVocabMap[nextGroup.index].id))
          );

          const isNeighborScaling = isPrevScaling || isNextScaling;

          elements.push(
            <motion.span 
              key={group.index} 
              className="inline-block"
              animate={{ 
                width: isNeighborScaling ? '1em' : '0.35em',
                scale: isNeighborScaling ? 1.2 : 1
              }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              &nbsp;
            </motion.span>
          );
        } else if (group.type === 'punct') {
          elements.push(
            <span key={group.index} className="text-[22px] text-luxury-muted opacity-40 px-0.5 font-serif italic">
              {group.content}
            </span>
          );
        } else {
          const wordToMatch = group.word || group.content;
          elements.push(
            <FisheyeWord
              key={group.index}
              index={group.index}
              word={wordToMatch}
              hoveredIndex={hoveredIndex}
              isHighlighted={!!vocab}
              color={vocab?.color}
              onMouseEnter={() => setHoveredIndex(group.index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => vocab && onWordClick?.(vocab.word)}
            />
          );
          if (group.type === 'word-with-punct') {
            elements.push(
              <span key={`punct-${group.index}`} className="text-[22px] text-luxury-muted opacity-40 font-serif italic pr-1">
                {group.punct}
              </span>
            );
          }
        }
      }
    }
    return elements;
  }, [groups, segmentVocabMap, hoveredVocabId, hoveredIndex, onWordClick]);

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto h-full overflow-hidden px-16 relative">
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pt-12 pb-32">
        {/* 段落图片 - 固定 240px，保持位置占位 */}
        <div className="w-full max-w-4xl h-[240px] mb-12 self-center relative flex items-center justify-center">
          {displayImage ? (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full h-full relative group overflow-hidden border border-luxury-text/5"
            >
              <img 
                src={displayImage} 
                alt="Editorial" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 scale-105 group-hover:scale-100 transition-all duration-[2000ms] ease-out" 
              />
            </motion.div>
          ) : (
            /* 无图片时的占位占位符，或者保持空白高度 */
            <div className="w-full h-full" />
          )}
        </div>

        {/* 文章内容 - 参考编辑模式样式 */}
        <div className="max-w-4xl mx-auto w-full overflow-visible">
          <div className="block leading-relaxed -mr-24 pr-24">
            {renderedContent}
          </div>
        </div>
      </div>
    </div>
  );
};
