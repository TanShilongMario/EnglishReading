import React from 'react';
import { TEMPLATES, EntryTemplate } from '../../config/templates';

interface TemplateSelectorProps {
  onSelect: (templateId: string) => void;
  selectedTemplateId?: string;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect, selectedTemplateId }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.values(TEMPLATES).map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          isSelected={selectedTemplateId === template.id}
          onSelect={() => onSelect(template.id)}
        />
      ))}
    </div>
  );
};

interface TemplateCardProps {
  template: EntryTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, isSelected, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className={`
        relative p-8 border-2 transition-all duration-300 text-left
        ${isSelected
          ? 'border-luxury-gold bg-luxury-gold/5 shadow-lg'
          : 'border-luxury-text/20 hover:border-luxury-gold/50 hover:bg-luxury-text/5'
        }
      `}
    >
      {/* 选中标记 */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-luxury-gold rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* 标题 */}
      <h3 className="text-xl font-bold text-luxury-text mb-3">{template.name}</h3>

      {/* 描述 */}
      <p className="text-base text-luxury-muted leading-relaxed">{template.description}</p>
    </button>
  );
};
