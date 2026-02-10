import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2 } from 'lucide-react';
import { getTemplate } from '../../config/templates';
import { FieldRenderer } from './FieldRenderers';

interface WordCardProps {
  word: (Vocabulary & { isGlobal?: boolean }) | null;
  templateId?: string;
  onClose: () => void;
  onExclude?: (word: string) => void;
}

export const WordCard: React.FC<WordCardProps> = ({ word, templateId = 'english-reading', onClose, onExclude }) => {
  const template = getTemplate(templateId);

  if (!word) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed right-0 top-20 bottom-0 w-full sm:w-[85vw] lg:w-[450px] bg-luxury-bg border-l border-luxury-text/20 p-6 sm:p-10 lg:p-16 flex flex-col z-[70] shadow-2xl"
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 p-2 text-luxury-text/40 hover:text-luxury-gold transition-colors group"
        >
          <X size={24} strokeWidth={1} className="group-hover:rotate-90 transition-transform duration-500" />
        </button>

        {/* 滚动内容区 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-8">
          {/* 顶部标签 */}
          <header className="mb-12 space-y-4">
            <div className="flex justify-between items-start">
              <span
                className="text-xxs uppercase tracking-[0.4em] font-bold"
                style={{ color: word.color || template.highlightStyle.defaultColor }}
              >
                {template.name}
              </span>
              {word.isGlobal && onExclude && (
                <button
                  onClick={() => onExclude(word.word)}
                  className="text-xxs2 uppercase tracking-widest bg-red-800/10 text-red-800 px-2 py-1 hover:bg-red-800 hover:text-white transition-all font-bold"
                >
                  Hide from this para
                </button>
              )}
            </div>

            {/* Header Fields */}
            <div className="space-y-6">
              {template.cardLayout.headerFields.map((fieldKey) => {
                const fieldConfig = template.fields.find(f => f.key === fieldKey);
                if (!fieldConfig) return null;

                // word 字段特殊处理（大标题）
                if (fieldKey === 'word') {
                  return (
                    <h2
                      key={fieldKey}
                      className="text-5xl font-serif leading-tight tracking-tight break-words"
                      style={{ color: word.color || template.highlightStyle.defaultColor }}
                    >
                      {word.word}
                    </h2>
                  );
                }

                return (
                  <div key={fieldKey}>
                    <FieldRenderer config={fieldConfig} value={word[fieldKey]} word={word} />
                  </div>
                );
              })}
            </div>
          </header>

          {/* Body Fields */}
          <div className="space-y-12">
            {template.cardLayout.bodyFields.map((fieldKey) => {
              const fieldConfig = template.fields.find(f => f.key === fieldKey);
              if (!fieldConfig) return null;

              // 跳过 word 字段（已在 header 显示）
              if (fieldKey === 'word') return null;

              const value = word[fieldKey];

              if (!value) return null;

              return (
                <section key={fieldKey} className="space-y-4">
                  <FieldRenderer config={fieldConfig} value={value} word={word} />
                </section>
              );
            })}
          </div>

          {/* Footer Fields (可选) */}
          {template.cardLayout.footerFields && template.cardLayout.footerFields.length > 0 && (
            <div className="mt-16 pt-8 border-t border-luxury-text/10 space-y-8">
              {template.cardLayout.footerFields.map((fieldKey) => {
                const fieldConfig = template.fields.find(f => f.key === fieldKey);
                if (!fieldConfig) return null;

                const value = word[fieldKey];
                if (!value) return null;

                return (
                  <div key={fieldKey}>
                    <FieldRenderer config={fieldConfig} value={value} word={word} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
