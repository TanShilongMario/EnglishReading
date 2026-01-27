import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Bookmark, Share2, Maximize2 } from 'lucide-react';

interface WordCardProps {
  word: (Vocabulary & { isGlobal?: boolean }) | null;
  onClose: () => void;
  onExclude?: (word: string) => void;
}

export const WordCard: React.FC<WordCardProps> = ({ word, onClose, onExclude }) => {
  const [isImageZoomed, setIsImageZoomed] = React.useState(false);
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (word?.imageData) {
      const url = URL.createObjectURL(word.imageData);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setObjectUrl(null);
    }
  }, [word?.imageData, word?.id]);

  const displayImage = objectUrl || word?.image;

  const renderHighlightedExample = (example: string, searchWord: string, patterns?: string) => {
    if (!searchWord) return example;

    // 构建匹配词列表：原词 + 匹配模式中的词
    const searchTerms = [searchWord];
    if (patterns) {
      patterns.split(',').forEach(p => {
        const trimmed = p.trim();
        if (trimmed) searchTerms.push(trimmed);
      });
    }

    // 按照长度降序排序，优先匹配长词（防止 overlap 时短词截断长词）
    searchTerms.sort((a, b) => b.length - a.length);

    // 创建正则，不区分大小写，单词边界匹配
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
    <AnimatePresence>
      {word && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed right-0 top-20 bottom-0 w-[450px] bg-luxury-bg border-l border-luxury-text/20 p-16 flex flex-col z-[70] shadow-2xl"
        >
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2 text-luxury-text/40 hover:text-luxury-gold transition-colors group"
          >
            <X size={24} strokeWidth={1} />
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
            <header className="mb-16 space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: word.color || '#E2B933' }}>
                  {word.isGlobal ? 'Shared Vocabulary' : 'Vocabulary Entry'}
                </span>
                {word.isGlobal && onExclude && (
                  <button 
                    onClick={() => onExclude(word.word)}
                    className="text-[9px] uppercase tracking-widest bg-red-800/10 text-red-800 px-2 py-1 hover:bg-red-800 hover:text-white transition-all font-bold"
                  >
                    Hide from this para
                  </button>
                )}
              </div>
              <h2 className="text-7xl font-serif leading-none tracking-tighter" style={{ color: word.color || '#E2B933' }}>{word.word}</h2>
              <div className="flex items-center gap-4 text-luxury-muted font-serif italic text-xl">
                {word.partOfSpeech && (
                  <span className="text-luxury-muted/60">{word.partOfSpeech}</span>
                )}
                <p>{word.phonetic}</p>
                <button 
                  className="transition-colors"
                  style={{ color: word.color || '#E2B933' }}
                >
                  <Volume2 size={18} strokeWidth={1.5} />
                </button>
              </div>
            </header>

            <div className="space-y-16">
              <section className="space-y-6 text-left">
                <div className="space-y-4">
                  <p className="text-xl font-serif leading-relaxed italic text-luxury-text/80">{word.definition}</p>
                  <p className="text-xl font-bold leading-tight text-luxury-text">{word.translation}</p>
                </div>
              </section>

              {word.examples.length > 0 && (
                <section className="space-y-8">
                  <div className="space-y-10">
                    {word.examples.map((example, i) => (
                      <div 
                        key={i} 
                        className="relative pl-8 border-l-2 group"
                        style={{ borderLeftColor: `${word.color || '#E2B933'}4D` }}
                      >
                        <p className="text-lg font-sans leading-relaxed text-luxury-muted group-hover:text-luxury-text transition-colors duration-500 text-left">
                          {renderHighlightedExample(example, word.word, word.matchPattern)}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {displayImage && (
                <div 
                  className="w-full overflow-hidden border border-luxury-text/10 cursor-zoom-in group relative"
                  onClick={() => setIsImageZoomed(true)}
                >
                  <img 
                    src={displayImage} 
                    alt={word.word} 
                    className="w-full h-auto block grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
                    <div className="bg-luxury-bg/90 p-1.5 shadow-sm border border-luxury-text/10">
                      <Maximize2 size={12} className="text-luxury-text/60" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* 图片放大模态框 */}
      <AnimatePresence>
        {isImageZoomed && displayImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-luxury-bg/90 backdrop-blur-xl p-8 md:p-20"
            onClick={() => setIsImageZoomed(false)}
          >
            <button 
              onClick={() => setIsImageZoomed(false)}
              className="absolute top-8 right-8 p-3 bg-luxury-text text-luxury-bg rounded-full hover:scale-110 transition-transform z-[110]"
            >
              <X size={24} />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={displayImage} 
              alt="Zoomed" 
              className="max-w-full max-h-full object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};
