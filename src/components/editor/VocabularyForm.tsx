import React, { useState, useEffect } from 'react';
import { Trash2, Search, Book, CheckSquare, Square } from 'lucide-react';
import { getTemplate, EntryTemplate } from '../../config/templates';
import { Vocabulary } from '../../api/db';
import { FieldInput } from './FieldInputs';
import { SentenceService, SentenceMatch } from '../../services/SentenceService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 预设颜色
const PRESET_COLORS = [
  { name: '金', value: '#E2B933' },
  { name: '绿', value: '#9BA876' },
  { name: '红', value: '#CD8D8B' },
  { name: '蓝', value: '#7996AC' },
  { name: '橙', value: '#C26D56' },
];

interface VocabularyFormProps {
  templateId: string;
  vocabulary: Partial<Vocabulary>;
  onChange: (field: string, value: any) => void;
  onSave?: () => void;
  onDelete?: () => void;
  isAutoSaving?: boolean;
}

export const VocabularyForm: React.FC<VocabularyFormProps> = ({
  templateId,
  vocabulary,
  onChange,
  onSave,
  onDelete,
  isAutoSaving
}) => {
  const template = getTemplate(templateId);
  const [contextualPool, setContextualPool] = useState<SentenceMatch[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // 扫描全库语境例句
  useEffect(() => {
    if (vocabulary.word && vocabulary.word.length > 2) {
      setIsScanning(true);
      SentenceService.searchContextualSentences(
        vocabulary.word, 
        vocabulary.matchPattern, 
        vocabulary.paragraphId
      ).then(results => {
        setContextualPool(results);
        setIsScanning(false);
      });
    } else {
      setContextualPool([]);
    }
  }, [vocabulary.word, vocabulary.matchPattern, vocabulary.paragraphId]);

  const toggleContextualExample = (match: SentenceMatch) => {
    const current = vocabulary.contextualExamples || [];
    const exists = current.find(ex => ex.text === match.text);
    
    let next;
    if (exists) {
      next = current.filter(ex => ex.text !== match.text);
    } else {
      next = [...current, { text: match.text, sourceTitle: match.sourceTitle, projectId: match.projectId }];
    }
    onChange('contextualExamples', next);
  };

  // 分组字段：基础字段（word, matchPattern）+ 例句 + 配图 + 其他
  const baseFields = template.fields.filter(f => f.key === 'word' || f.key === 'matchPattern');
  const examplesField = template.fields.find(f => f.key === 'examples');
  const imageField = template.fields.find(f => f.key === 'image');
  const otherFields = template.fields.filter(f => 
    f.key !== 'word' && 
    f.key !== 'matchPattern' && 
    f.key !== 'examples' && 
    f.key !== 'image'
  );

  const renderField = (fieldConfig: any) => (
    <div key={fieldConfig.key} className="space-y-3">
      <label className="text-xs uppercase tracking-widest text-luxury-muted font-bold flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-luxury-gold rounded-full" />
        {fieldConfig.label}
        {fieldConfig.required && <span className="text-red-800">*</span>}
      </label>
      <FieldInput
        config={fieldConfig}
        value={vocabulary[fieldConfig.key]}
        onChange={(value) => onChange(fieldConfig.key, value)}
        word={vocabulary}
      />
    </div>
  );

  return (
    <div className="space-y-12">
      {/* 头部 */}
      <header className="space-y-4">
        <div className="flex justify-between items-start">
          <span className="text-xxs uppercase tracking-[0.4em] text-luxury-gold font-bold">
            {template.name}
          </span>
          {isAutoSaving && (
            <span className="text-xxs uppercase tracking-widest text-luxury-gold animate-pulse font-bold flex items-center gap-2">
              <div className="w-1 h-1 bg-luxury-gold rounded-full" />
              正在自动保存...
            </span>
          )}
        </div>
        {vocabulary.id && (
          <button
            onClick={onDelete}
            className="text-xxs uppercase tracking-widest text-red-800 hover:text-red-600 transition-colors flex items-center gap-2"
          >
            <Trash2 size={12} />
            删除此词条
          </button>
        )}
      </header>

      {/* 基础字段（word, matchPattern） */}
      {baseFields.length > 0 && (
        <div className="grid grid-cols-1 gap-6 pb-8 border-b border-luxury-text/10">
          {baseFields.map(fieldConfig => (
            <div key={fieldConfig.key} className="space-y-3">
              <label className="text-xs uppercase tracking-widest text-luxury-muted font-bold flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-luxury-gold rounded-full" />
                {fieldConfig.label}
                {fieldConfig.required && <span className="text-red-800">*</span>}
              </label>
              <FieldInput
                config={fieldConfig}
                value={vocabulary[fieldConfig.key]}
                onChange={(value) => onChange(fieldConfig.key, value)}
                word={vocabulary}
              />
              {fieldConfig.key === 'word' && (
                <div className="space-y-4 pt-4">
                  <label className="text-xs uppercase tracking-widest text-luxury-muted font-bold flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-luxury-gold rounded-full" />
                    视觉标记颜色
                  </label>
                  <div className="flex gap-4">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c.value}
                        onClick={() => onChange('color', c.value)}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all transform hover:scale-110",
                          vocabulary.color === c.value ? "border-luxury-text scale-110 shadow-md" : "border-transparent opacity-40"
                        )}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 中间字段（音标、释义等） */}
      <div className="space-y-10">
        {otherFields.map(fieldConfig => renderField(fieldConfig))}
      </div>

      {/* 例句部分 + 跨文章语境池 */}
      <div className="space-y-10 pt-10 border-t border-luxury-text/10">
        {examplesField && renderField(examplesField)}
        
        {/* 跨文章语境例句池 */}
        {contextualPool.length > 0 && (
          <div className="space-y-6 pt-6">
            <div className="flex justify-between items-center">
              <label className="text-xs uppercase tracking-widest text-luxury-muted font-bold flex items-center gap-2">
                <Search size={14} className="text-luxury-gold" />
                来自其他文章的语境
              </label>
              {isScanning && (
                <span className="text-[10px] text-luxury-gold animate-pulse italic">正在扫描全库...</span>
              )}
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
              {contextualPool.map((match, idx) => {
                const isSelected = !!vocabulary.contextualExamples?.find(ex => ex.text === match.text);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleContextualExample(match)}
                    className={cn(
                      "w-full text-left p-4 border transition-all duration-500 group flex gap-4 items-start",
                      isSelected ? "bg-luxury-gold/5 border-luxury-gold/30 shadow-sm" : "bg-white/50 border-luxury-text/5 hover:border-luxury-gold/20"
                    )}
                  >
                    <div className="mt-1 shrink-0">
                      {isSelected ? <CheckSquare size={14} className="text-luxury-gold" /> : <Square size={14} className="text-luxury-muted/30 group-hover:text-luxury-gold/50" />}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-serif italic leading-relaxed text-luxury-text/80">{match.text}</p>
                      <p className="text-[9px] uppercase tracking-widest font-bold text-luxury-gold/60">— FROM 《{match.sourceTitle}》</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 配图放在最后 */}
      {imageField && (
        <div className="pt-10 border-t border-luxury-text/10">
          {renderField(imageField)}
        </div>
      )}

      {/* 保存按钮（仅用于新建词条） */}
      {!vocabulary.id && (
        <button
          onClick={onSave}
          className="w-full py-4 bg-[#D3CBB2] text-luxury-text hover:brightness-95 transition-all uppercase text-xxs tracking-widest font-bold shadow-sm"
        >
          保存词条
        </button>
      )}
    </div>
  );
};
