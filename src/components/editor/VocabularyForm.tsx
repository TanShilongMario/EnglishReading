import React from 'react';
import { Trash2 } from 'lucide-react';
import { getTemplate, EntryTemplate } from '../../config/templates';
import { Vocabulary } from '../../api/db';
import { FieldInput } from './FieldInputs';
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

  // 分组字段：基础字段（word, matchPattern）+ 其他字段
  const baseFields = template.fields.filter(f => f.key === 'word' || f.key === 'matchPattern');
  const otherFields = template.fields.filter(f => f.key !== 'word' && f.key !== 'matchPattern');

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

      {/* 其他字段 */}
      <div className="space-y-10">
        {otherFields.map(fieldConfig => (
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
        ))}
      </div>

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
