import React, { useState } from 'react';
import { FisheyeWord } from './FisheyeWord';
import { motion } from 'framer-motion';
import { Vocabulary } from '../../api/db';

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
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex flex-wrap justify-start items-baseline leading-relaxed">
            {groups.map((group, idx) => {
              if (group.type === 'space') {
                return (
                  <span key={group.index} className="text-[22px] text-luxury-muted opacity-40 font-serif italic">
                    {group.content}
                  </span>
                );
              }

              if (group.type === 'punct') {
                return (
                  <span key={group.index} className="text-[22px] text-luxury-muted opacity-40 px-0.5 font-serif italic">
                    {group.content}
                  </span>
                );
              }

              // 处理单词（可能带有标点）
              const wordToMatch = group.word || group.content;
              const cleanWord = wordToMatch.toLowerCase();
              
              // 改进的匹配逻辑：支持原型匹配、变形词匹配 (matchPattern)
              const matchedVocab = highlightedWords.find(hw => {
                const isExact = hw.word.toLowerCase() === cleanWord;
                const isPattern = hw.matchPattern?.split(',')
                  .map(p => p.trim().toLowerCase())
                  .includes(cleanWord);
                return isExact || isPattern;
              });

              return (
                <span key={group.index} className="inline-block whitespace-nowrap">
                  <FisheyeWord
                    index={group.index}
                    word={wordToMatch}
                    hoveredIndex={hoveredIndex}
                    isHighlighted={!!matchedVocab}
                    onClick={() => matchedVocab && onWordClick?.(matchedVocab.word)}
                    onMouseEnter={() => setHoveredIndex(group.index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  {group.type === 'word-with-punct' && (
                    <span className="text-[22px] text-luxury-muted opacity-40 font-serif italic pr-1">
                      {group.punct}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
