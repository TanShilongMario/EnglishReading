import React from 'react';
import { ExternalLink } from 'lucide-react';
import { FieldConfig } from '../../config/templates';

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

// 图片字段渲染器
export const ImageField: React.FC<{ config: FieldConfig; value: string; imageData?: Blob; word?: any }> = ({ config, value, imageData }) => {
  if (!value && !imageData) return null;

  const [isZoomed, setIsZoomed] = React.useState(false);
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (imageData instanceof Blob) {
      const url = URL.createObjectURL(imageData);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setObjectUrl(null);
    }
  }, [imageData]);

  const displayImage = objectUrl || value;

  if (!displayImage) return null;

  return (
    <div>
      {config.label && (
        <p className="text-xxs uppercase tracking-widest text-luxury-muted/60 mb-3">{config.label}</p>
      )}
      <div
        className="w-full overflow-hidden border border-luxury-text/10 cursor-zoom-in group relative"
        onClick={() => setIsZoomed(true)}
      >
        <img
          src={displayImage}
          alt={config.label}
          className="w-full h-auto block grayscale group-hover:grayscale-0 transition-all duration-700"
        />
      </div>

      {/* 放大预览 */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-xl p-8"
          onClick={() => setIsZoomed(false)}
        >
          <img
            src={displayImage}
            alt="Zoomed"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
};

// 主字段渲染器（根据类型路由到不同的渲染器）
export const FieldRenderer: React.FC<FieldRendererProps> = ({ config, value, word }) => {
  if (value === undefined || value === null || value === '') {
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
