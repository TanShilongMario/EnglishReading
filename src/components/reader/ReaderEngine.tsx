import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FisheyeWord } from './FisheyeWord';
import { motion, AnimatePresence } from 'framer-motion';
import { Vocabulary } from '../../api/db';
import { X, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 颜色转换辅助函数：将十六进制颜色转换为带透明度的 rgba 格式
function hexToRgba(hex: string, opacity: number): string {
  const color = hex || '#D4AF37';
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

interface ImageZoomProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

const ImageZoom: React.FC<ImageZoomProps> = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/95 backdrop-blur-xl p-8 md:p-20"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 p-3 bg-luxury-text text-luxury-bg rounded-full hover:scale-110 transition-transform z-[110]"
      >
        <X size={24} />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-8 top-1/2 -translate-y-1/2 p-4 text-white/40 hover:text-white transition-colors z-[110]"
          >
            <ChevronLeft size={48} strokeWidth={1} />
          </button>
          <button
            onClick={next}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-4 text-white/40 hover:text-white transition-colors z-[110]"
          >
            <ChevronRight size={48} strokeWidth={1} />
          </button>
        </>
      )}

      <motion.img 
        key={currentIndex}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        src={images[currentIndex]} 
        alt={`Zoomed ${currentIndex + 1}`} 
        className="max-w-full max-h-full object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      
          {images.length > 1 && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-4 py-1 bg-white/10 text-white/60 text-xs tracking-[0.3em] font-bold uppercase">
              {currentIndex + 1} / {images.length}
            </div>
          )}
    </motion.div>,
    document.body
  );
};

interface ReaderEngineProps {
  content: string;
  imageUrl?: string;
  imageData?: Blob;
  images?: string[];
  imagesData?: Blob[];
  highlightedWords: Vocabulary[]; 
  onWordClick?: (word: string) => void;
  fontClass?: string; 
  templateId?: string; 
}

export const ReaderEngine: React.FC<ReaderEngineProps> = ({
  content,
  imageUrl,
  imageData,
  images = [],
  imagesData = [],
  highlightedWords,
  onWordClick,
  fontClass = 'font-serif',
  templateId = 'english-reading'
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredVocabId, setHoveredVocabId] = useState<number | null>(null);
  const [objectUrls, setObjectUrls] = useState<string[]>([]);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 创建稳定依赖项，避免空数组导致的死循环
  const imagesDependency = JSON.stringify(images);
  const imagesDataDependency = imagesData.map(d => `${d.size}_${d.type}`).join('|');

  useEffect(() => {
    // 综合处理单图和多图
    const currentImagesData = imagesData.length > 0 ? imagesData : (imageData ? [imageData] : []);
    const currentImages = images.length > 0 ? images : (imageUrl ? [imageUrl] : []);
    
    const urls = currentImagesData
      .filter(d => d instanceof Blob)
      .map(d => URL.createObjectURL(d as Blob))
      .concat(currentImages);
    setObjectUrls(urls);
    
    return () => urls.forEach(url => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });
  }, [imageUrl, imageData, imagesDependency, imagesDataDependency]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % objectUrls.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + objectUrls.length) % objectUrls.length);
  };

  const displayImage = objectUrls[currentImageIndex];

  // 检测文本是否主要为中文
  const isChineseText = React.useMemo(() => {
    const chineseCharCount = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const totalChars = content.replace(/\s/g, '').length;
    return totalChars > 0 && chineseCharCount / totalChars > 0.3;
  }, [content]);

  // 为中文文本创建高亮标记
  const highlightedContent = React.useMemo(() => {
    if (!isChineseText || highlightedWords.length === 0) {
      return null; // 不是中文或没有词汇，返回 null 使用原有逻辑
    }

    let processedContent = content;

    // 按长度降序排列，优先匹配长词（避免短词覆盖长词）
    const sortedVocabs = [...highlightedWords].sort((a, b) => b.word.length - a.word.length);

    sortedVocabs.forEach(vocab => {
      const term = vocab.word;
      const patterns = [term, ...(vocab.matchPattern?.split(/[,，]/).map(p => p.trim()) || [])];

      patterns.forEach(pattern => {
        if (!pattern) return;

        // 创建正则表达式，全局匹配该术语
        const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

        // 转换颜色为带透明度的 rgba 格式
        const colorWithOpacity = hexToRgba(vocab.color || '#D4AF37', 0.4);
        const colorWithOpacityHover = hexToRgba(vocab.color || '#D4AF37', 0.7);

        // 替换为高亮标记，使用 data 属性存储词汇 ID
        processedContent = processedContent.replace(regex, (match) => {
          return `<mark class="marker-highlight" data-vocab-id="${vocab.id}" style="--highlight-color: ${colorWithOpacity}; --highlight-color-hover: ${colorWithOpacityHover}">${match}</mark>`;
        });
      });
    });

    return processedContent;
  }, [content, highlightedWords, isChineseText]);

  // 改进的分词逻辑：将标点符号合并到前面的单词中，避免标点符号单独换行
  const groups = React.useMemo(() => {
    const rawSegments = content.split(/(\s+|[.,!?;:()])/g).filter(Boolean);
    const result: any[] = [];
    
    for (let i = 0; i < rawSegments.length; i++) {
      const current = rawSegments[i];
      const isSpace = /^\s+$/.test(current);
      const isPunct = /^[.,!?;:()]$/.test(current);
      
      if (isSpace) {
        result.push({
          type: 'space',
          content: current,
          index: i
        });
      } else if (isPunct) {
        result.push({
          type: 'punct',
          content: current,
          index: i
        });
      } else {
        result.push({
          type: 'word',
          content: current,
          index: i
        });
      }
    }
    return result;
  }, [content]);

  // 计算每个 segment 对应的词汇映射，支持词组及不连续匹配（如 explain...in）
  const segmentVocabMap = React.useMemo(() => {
    const map: Record<number, Vocabulary & { isGlobal?: boolean }> = {};
    if (highlightedWords.length === 0) return map;

    // 按长度降序排列，优先匹配长词组
    const sortedVocabs = [...highlightedWords].sort((a, b) => b.word.length - a.word.length);

    sortedVocabs.forEach(vocab => {
      // 兼容中文和英文逗号
      const patterns = [vocab.word, ...(vocab.matchPattern?.split(/[,，]/).map(p => p.trim()) || [])]
        .filter(Boolean)
        .map(p => p.toLowerCase());

      patterns.forEach(pattern => {
        // 支持不连续匹配，使用 '...' 作为分隔符
        const parts = pattern.split('...');
        const partWordsList = parts.map(p => p.trim().split(/\s+/).filter(Boolean));
        if (partWordsList.length === 0 || partWordsList[0].length === 0) return;
        
        // 在 groups 中寻找匹配
        for (let i = 0; i < groups.length; i++) {
          let currentGroupIdx = i;
          let matchedAllParts = true;
          const rangesToMark: {start: number, end: number}[] = [];

          for (let pIdx = 0; pIdx < partWordsList.length; pIdx++) {
            const partWords = partWordsList[pIdx];
            let partFound = false;

            // 第一部分必须从当前位置 i 开始，后续部分可以在一定范围内搜索
            // 搜索限制：后续部分最多往后找 15 个词（约 30 个 groups，含空格标点）
            const searchLimit = pIdx === 0 ? i + 1 : currentGroupIdx + 30;

            for (let searchIdx = (pIdx === 0 ? i : currentGroupIdx); searchIdx < Math.min(groups.length, searchLimit); searchIdx++) {
              let gIdx = searchIdx;
              let wIdx = 0;
              const currentPartIndices: number[] = [];

              while (wIdx < partWords.length && gIdx < groups.length) {
                const group = groups[gIdx];
                if (group.type === 'space') {
                  // 如果这部分内部有空格，记录但不计入 word 匹配
                  gIdx++;
                  continue;
                }
                const currentWord = (group.word || group.content || '').toLowerCase();
                if (currentWord === partWords[wIdx]) {
                  currentPartIndices.push(gIdx);
                  wIdx++;
                  gIdx++;
                } else {
                  break;
                }
              }

              if (wIdx === partWords.length) {
                partFound = true;
                const first = currentPartIndices[0];
                const last = currentPartIndices[currentPartIndices.length - 1];
                rangesToMark.push({ start: first, end: last });
                currentGroupIdx = gIdx;
                break;
              }
              if (pIdx === 0) break; // 第一部分匹配失败则停止
            }

            if (!partFound) {
              matchedAllParts = false;
              break;
            }
          }

          if (matchedAllParts) {
            // 找到完整匹配，标记所有相关索引
            rangesToMark.forEach(range => {
              for (let k = range.start; k <= range.end; k++) {
                // 只有当该位置还没被更高优先级的词汇占用时才标记
                if (!map[groups[k].index]) {
                  map[groups[k].index] = vocab;
                }
              }
            });
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

        // 计算颜色和透明度
        const highlightOpacity = vocab.isGlobal ? 0.3 : 0.4;
        const highlightColor = hexToRgba(vocab.color || '#E2B933', highlightOpacity);

        elements.push(
          <motion.span
            key={`phrase-${vocab.id}-${group.index}`}
            className={cn(
              "inline cursor-pointer transition-all duration-300",
              isPhraseHovered && "z-20 relative"
            )}
            style={{
              backgroundImage: `linear-gradient(to bottom, transparent 50%, ${highlightColor} 50%)`
            }}
            onMouseEnter={() => setHoveredVocabId(vocab.id!)}
            onMouseLeave={() => setHoveredVocabId(null)}
            onClick={(e) => { e.stopPropagation(); onWordClick?.(vocab.word); }}
          >
            {phraseItems.map((item) => {
              if (item.type === 'space') {
                return (
                  <motion.span 
                    key={item.index} 
                    className={item.content?.includes('\n') ? "inline" : "inline-block"}
                    animate={item.content?.includes('\n') ? {} : { 
                      // 适度减小空格放大倍数，保持动效的同时减少对排版的冲击
                      width: isPhraseHovered ? '0.8em' : '0.35em',
                      scale: isPhraseHovered ? 1.2 : 1 
                    }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  >
                    {item.content || '\u00A0'}
                  </motion.span>
                );
              }

              if (item.type === 'punct') {
                return (
                  <motion.span 
                    key={item.index} 
                    className={cn("inline-block text-[22px] text-luxury-text px-0.5", fontClass)}
                    animate={{ 
                      scale: isPhraseHovered ? 1.2 : 1
                    }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    style={{ opacity: 1 }}
                  >
                    {item.content}
                  </motion.span>
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
                  isHighlighted={true}
                  color={vocab.color}
                  hideMargin={true}
                  fontClass={fontClass}
                />
              );
            })}
          </motion.span>
        );
        i = j - 1; // 跳过已处理的项目
      } else {
        // 非高亮内容
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

        if (group.type === 'space') {
          const hasNewline = group.content?.includes('\n');
          elements.push(
            <motion.span 
              key={group.index} 
              className={hasNewline ? "inline" : "inline-block"}
              animate={hasNewline ? {} : { 
                // 邻居空格也适度变宽，配合缓冲区实现平滑鱼眼
                width: isNeighborScaling ? '0.8em' : '0.35em',
                scale: isNeighborScaling ? 1.2 : 1
              }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {group.content || '\u00A0'}
            </motion.span>
          );
        } else if (group.type === 'punct') {
          elements.push(
            <motion.span 
              key={group.index} 
              className={cn("inline-block text-[22px] text-luxury-text px-0.5", fontClass)}
              animate={{ 
                scale: isNeighborScaling ? 1.2 : 1,
                marginLeft: isPrevScaling ? 12 : 0,
                marginRight: isNextScaling ? 12 : 0,
              }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ opacity: 1 }}
            >
              {group.content}
            </motion.span>
          );
        } else {
          const wordToMatch = group.word || group.content;
          elements.push(
            <FisheyeWord
              key={group.index}
              index={group.index}
              word={wordToMatch}
              hoveredIndex={hoveredIndex}
              isHighlighted={false}
              fontClass={fontClass}
              onMouseEnter={() => setHoveredIndex(group.index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          );
        }
      }
    }
    return elements;
  }, [groups, segmentVocabMap, hoveredVocabId, hoveredIndex, onWordClick, fontClass]);

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto h-full overflow-hidden px-4 sm:px-8 lg:px-16 relative">
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pt-8 lg:pt-12 pb-16">
        {/* 段落图片 - 固定 240px，保持位置占位 */}
        <div className="w-full max-w-4xl h-[160px] sm:h-[200px] lg:h-[240px] mb-6 sm:mb-8 lg:mb-12 self-center relative flex items-center justify-center">
          {displayImage ? (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full h-full relative group overflow-hidden border border-luxury-text/5 cursor-zoom-in"
              onClick={(e) => { e.stopPropagation(); setIsImageZoomed(true); }}
            >
              <motion.img 
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                src={displayImage} 
                alt="Editorial" 
                className="w-full h-full object-cover transition-all duration-[2000ms] ease-out" 
              />
              
              {/* 导航箭头 */}
              {objectUrls.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-luxury-bg/80 text-luxury-text backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-luxury-text hover:text-luxury-bg border border-luxury-text/10"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-luxury-bg/80 text-luxury-text backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-luxury-text hover:text-luxury-bg border border-luxury-text/10"
                  >
                    <ChevronRight size={20} />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-luxury-bg/80 text-luxury-text backdrop-blur-md text-[10px] tracking-[0.2em] font-bold border border-luxury-text/10">
                    {currentImageIndex + 1} / {objectUrls.length}
                  </div>
                </>
              )}

              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-4 pointer-events-none">
                <div className="bg-luxury-bg/90 p-2 shadow-sm border border-luxury-text/10">
                  <Maximize2 size={14} className="text-luxury-text/60" />
                </div>
              </div>
            </motion.div>
          ) : (
            /* 无图片时的占位占位符，或者保持空白高度 */
            <div className="w-full h-full" />
          )}
        </div>

        {/* 图片放大模态框 */}
        <AnimatePresence>
          {isImageZoomed && objectUrls.length > 0 && (
            <ImageZoom 
              images={objectUrls} 
              initialIndex={currentImageIndex}
              onClose={() => setIsImageZoomed(false)} 
            />
          )}
        </AnimatePresence>

        {/* 文章内容 - 采用更加宽阔的溢出缓冲区方案，彻底解决鱼眼放大导致的换行抖动 */}
        <div className="max-w-4xl mx-auto w-full overflow-visible">
          {/*
            -mx-120 (左右各拉伸 480px 缓冲区)
            px-120 (左右各内缩 480px，使文字内容回到 max-w-4xl 边界内)
            扩大缓冲区可以为鱼眼放大提供更多的水平“呼吸空间”，配合 leading-[1.8] 增加垂直稳定性
          */}
          <div className={cn("block leading-[1.8] -mx-120 px-120 whitespace-pre-wrap text-left", fontClass)}>
            {isChineseText && highlightedContent ? (
              /* 中文文本：使用 HTML 高亮渲染 */
              <div
                className="text-xl leading-relaxed"
                dangerouslySetInnerHTML={{ __html: highlightedContent }}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.tagName === 'MARK') {
                    const vocabId = target.getAttribute('data-vocab-id');
                    const vocab = highlightedWords.find(v => v.id === Number(vocabId));
                    if (vocab && onWordClick) {
                      onWordClick(vocab.word);
                    }
                  }
                }}
                style={{ cursor: 'pointer' }}
              />
            ) : (
              /* 英文文本：使用现有的 groups 渲染逻辑 */
              renderedContent
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
