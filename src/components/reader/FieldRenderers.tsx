import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { FieldConfig } from '../../config/templates';
import { parseMarkdown } from '../../utils/markdown';

interface FieldRendererProps {
  config: FieldConfig;
  value: any;
  word?: any;
}

// 文本字段渲染器
export const TextField: React.FC<{ config: FieldConfig; value: string; word?: any }> = ({ config, value }) => {
  if (!value) return null;

  const fontSizeClass = config.displayConfig?.fontSize
    ? `text-${config.displayConfig.fontSize}`
    : 'text-base';

  return (
    <div className={fontSizeClass}>
      {config.label && (
        <span className="text-luxury-muted/60 mr-2">{config.label}:</span>
      )}
      <span>{value}</span>
    </div>
  );
};

// 多行文本字段渲染器
export const TextareaField: React.FC<{ config: FieldConfig; value: string; word?: any }> = ({ config, value }) => {
  if (!value) return null;

  const fontSizeClass = config.displayConfig?.fontSize
    ? `text-${config.displayConfig.fontSize}`
    : 'text-lg';

  const fontStyleClass = config.displayConfig?.fontStyle === 'italic'
    ? 'italic'
    : '';

  return (
    <div>
      {config.label && (
        <p className="text-xxs uppercase tracking-widest text-luxury-muted/60 mb-2">{config.label}</p>
      )}
      <p className={`${fontSizeClass} ${fontStyleClass} text-luxury-text/80 leading-relaxed`}>
        {value}
      </p>
    </div>
  );
};

// 标签字段渲染器（用于 examples, relatedConcepts 等）
export const TagsField: React.FC<{ config: FieldConfig; values: string[]; word?: any }> = ({ config, values, word }) => {
  if (!values || values.length === 0) return null;

  const isExamples = config.key === 'examples';
  const isReferenceLink = config.key === 'referenceLink';

  // 参考链接特殊处理
  if (isReferenceLink) {
    return (
      <div className="space-y-2">
        {config.label && (
          <p className="text-xxs uppercase tracking-widest text-luxury-muted/60 mb-3">{config.label}</p>
        )}
        {values.map((link, index) => (
          <a
            key={index}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-luxury-gold hover:text-luxury-text transition-colors"
          >
            <ExternalLink size={14} strokeWidth={1.5} />
            <span className="underline truncate">{link}</span>
          </a>
        ))}
      </div>
    );
  }

  // 例句特殊处理（支持高亮）
  if (isExamples && word) {
    const renderHighlightedExample = (example: string) => {
      if (!word.word) return example;

      const searchTerms = [word.word];
      if (word.matchPattern) {
        word.matchPattern.split(',').forEach(p => {
          const trimmed = p.trim();
          if (trimmed) searchTerms.push(trimmed);
        });
      }

      searchTerms.sort((a, b) => b.length - a.length);
      const regex = new RegExp(`\\b(${searchTerms.join('|')})\\b`, 'gi');
      const parts = example.split(regex);

      return (
        <>
          {parts.map((part, i) => {
            const isMatch = searchTerms.some(term => term.toLowerCase() === part.toLowerCase());
            return isMatch ? (
              <span
                key={i}
                className="font-bold underline underline-offset-4"
                style={{
                  color: word.color || '#E2B933',
                  textDecorationColor: `${word.color || '#E2B933'}4D`
                }}
              >
                {part}
              </span>
            ) : (
              part
            );
          })}
        </>
      );
    };

    return (
      <div className="space-y-3">
        {config.label && (
          <p className="text-xxs uppercase tracking-widest text-luxury-muted/60 mb-3">{config.label}</p>
        )}
        {values.map((example, i) => (
          <div
            key={i}
            className="relative pl-8 border-l-2 group"
            style={{ borderLeftColor: `${word.color || '#E2B933'}4D` }}
          >
            <p className="text-lg font-sans leading-relaxed text-luxury-muted group-hover:text-luxury-text transition-colors duration-500 text-left">
              {renderHighlightedExample(example)}
            </p>
          </div>
        ))}

        {/* 渲染选中的跨文章语境例句 */}
        {word.contextualExamples && word.contextualExamples.length > 0 && (
          <div className="space-y-8 pt-8 mt-8 border-t border-luxury-text/5">
            <div className="flex items-center gap-3 opacity-40">
              <div className="h-px flex-1 bg-luxury-text/20" />
              <span className="text-xxs uppercase tracking-[0.2em] font-bold">More Contexts</span>
              <div className="h-px flex-1 bg-luxury-text/20" />
            </div>
            <div className="space-y-10">
              {word.contextualExamples.map((ex: any, i: number) => (
                <div 
                  key={`ctx-${i}`} 
                  className="relative pl-8 border-l-2 border-luxury-gold/20 group"
                >
                  <p className="text-lg font-serif italic leading-relaxed text-luxury-muted group-hover:text-luxury-text transition-colors duration-500 text-left">
                    {renderHighlightedExample(ex.text)}
                  </p>
                  <p className="mt-3 text-xxs2 uppercase tracking-widest font-bold text-luxury-gold/40 text-left">
                    — FROM 《{ex.sourceTitle}》
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 通用标签渲染
  return (
    <div>
      {config.label && (
        <p className="text-xxs uppercase tracking-widest text-luxury-muted/60 mb-3">{config.label}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {values.map((tag, index) => (
          <span
            key={index}
            className="text-xxs uppercase tracking-wider px-3 py-1 bg-luxury-text/5 text-luxury-muted border border-luxury-text/10"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

// Markdown 字段渲染器（扩展阅读）
export const MarkdownField: React.FC<{ config: FieldConfig; value: string; word?: any }> = ({ config, value }) => {
  if (!value) return null;

  // 简单的 Markdown 解析（支持加粗、链接、换行）
  const parseMarkdown = (text: string) => {
    // 处理链接 [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-luxury-gold hover:text-luxury-text underline">$1</a>');

    // 处理加粗 **text**
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // 处理换行
    text = text.replace(/\n/g, '<br />');

    return text;
  };

  return (
    <div>
      {config.label && (
        <p className="text-xxs uppercase tracking-widest text-luxury-muted/60 mb-3">{config.label}</p>
      )}
      <div
        className="text-sm text-luxury-muted leading-relaxed space-y-2"
        dangerouslySetInnerHTML={{ __html: parseMarkdown(value) }}
      />
    </div>
  );
};

// 图片轮播组件中的放大预览独立成组件以确保 Portal 稳定性
interface VocabImageZoomProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
}

const VocabImageZoom: React.FC<VocabImageZoomProps> = ({ images, currentIndex, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onPrev(new MouseEvent('click') as any);
      else if (e.key === 'ArrowRight') onNext(new MouseEvent('click') as any);
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrev, onNext, onClose]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/95 backdrop-blur-xl p-8 md:p-20"
      onClick={onClose}
    >
      <button 
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-8 right-8 p-3 bg-luxury-text text-luxury-bg rounded-full hover:scale-110 transition-transform z-[3100]"
      >
        <X size={24} />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-8 top-1/2 -translate-y-1/2 p-4 text-white/40 hover:text-white transition-colors z-[3100]"
          >
            <ChevronLeft size={48} strokeWidth={1} />
          </button>
          <button
            onClick={onNext}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-4 text-white/40 hover:text-white transition-colors z-[3100]"
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
        alt="Zoomed"
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

// 图片轮播组件
const ImageSlider: React.FC<{ images: string[]; label?: string }> = ({ images, label }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images || images.length === 0) return null;

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-xxs uppercase tracking-widest text-luxury-muted/60 mb-3">{label}</p>
      )}
      
      <div className="relative group aspect-video bg-luxury-paper/10 border border-luxury-text/10 overflow-hidden cursor-zoom-in z-10"
           onClick={(e) => { 
             e.stopPropagation(); 
             setIsZoomed(true); 
           }}>
        <img
          src={images[currentIndex]}
          alt={`${label || 'Image'} ${currentIndex + 1}`}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 pointer-events-none"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/40 text-[10px] text-white tracking-widest font-bold">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {isZoomed && (
          <VocabImageZoom 
            images={images}
            currentIndex={currentIndex}
            onClose={() => setIsZoomed(false)}
            onPrev={prev}
            onNext={next}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// 图片字段渲染器
export const ImageField: React.FC<{ config: FieldConfig; value: string; imageData?: Blob; word?: any }> = ({ config, value, imageData, word }) => {
  const [objectUrls, setObjectUrls] = React.useState<string[]>([]);

  // 创建稳定依赖项，避免对象引用变化导致的死循环
  const imagesDependency = JSON.stringify(word?.images || []);
  const imagesDataDependency = (word?.imagesData || []).map((d: any) => `${d.size}_${d.type}`).join('|');

  React.useEffect(() => {
    // 综合多图数据和单图旧数据
    const imagesDataList = word?.imagesData || (imageData ? [imageData] : []);
    const imagesList = word?.images || (value ? [value] : []);
    
    const urls = imagesDataList
      .filter((d: any) => d instanceof Blob)
      .map((d: any) => URL.createObjectURL(d))
      .concat(imagesList);
    setObjectUrls(urls);
    
    return () => urls.forEach(url => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });
  }, [value, imageData, imagesDependency, imagesDataDependency]);

  if (objectUrls.length === 0) return null;

  return <ImageSlider images={objectUrls} label={config.label} />;
};


// 主字段渲染器（根据类型路由到不同的渲染器）
export const FieldRenderer: React.FC<FieldRendererProps> = ({ config, value, word }) => {
  // 图片字段：兼容单图和多图渲染判断
  const hasContent = value !== undefined && value !== null && value !== '' || 
                    (config.type === 'image' && (word?.imageData || (word?.images && word.images.length > 0) || (word?.imagesData && word.imagesData.length > 0)));
  if (!hasContent) {
    return null;
  }

  switch (config.type) {
    case 'text':
      return <TextField config={config} value={value} word={word} />;

    case 'textarea':
      return <TextareaField config={config} value={value} word={word} />;

    case 'tags':
      return <TagsField config={config} values={value} word={word} />;

    case 'markdown':
      return <MarkdownField config={config} value={value} word={word} />;

    case 'image':
      return <ImageField config={config} value={value} imageData={word?.imageData} word={word} />;

    default:
      return null;
  }
};
