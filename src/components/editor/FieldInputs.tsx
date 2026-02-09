import React from 'react';
import { Upload, X as CloseIcon, Link } from 'lucide-react';
import { FieldConfig } from '../../config/templates';

interface FieldInputProps {
  config: FieldConfig;
  value: any;
  onChange: (value: any) => void;
  word?: any;
}

// 文本输入
export const TextInput: React.FC<{ config: FieldConfig; value: string; onChange: (value: string) => void }> = ({ config, value, onChange }) => {
  return (
    <input
      placeholder={config.placeholder || `请输入${config.label}`}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-transparent text-lg outline-none border-b border-luxury-text/10 focus:border-luxury-gold transition-colors py-2"
    />
  );
};

// 多行文本输入
export const TextareaInput: React.FC<{ config: FieldConfig; value: string; onChange: (value: string) => void }> = ({ config, value, onChange }) => {
  return (
    <textarea
      placeholder={config.placeholder || `请输入${config.label}`}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      rows={4}
      className="w-full bg-luxury-paper/20 text-base outline-none border border-luxury-text/10 focus:border-luxury-gold transition-colors p-4 resize-none leading-relaxed"
    />
  );
};

// 标签输入（用于 examples, relatedConcepts, referenceLink）
export const TagsInput: React.FC<{ config: FieldConfig; values: string[]; onChange: (values: string[]) => void }> = ({ config, values, onChange }) => {
  const displayValues = values && values.length > 0 ? values : [''];

  const handleChange = (index: number, newValue: string) => {
    const newValues = [...displayValues];
    newValues[index] = newValue;
    onChange(newValues.filter(v => v.trim() !== ''));
  };

  const handleAdd = () => {
    onChange([...displayValues, '']);
  };

  const handleRemove = (index: number) => {
    const newValues = displayValues.filter((_, i) => i !== index);
    onChange(newValues.length > 0 ? newValues : ['']);
  };

  const isReferenceLink = config.key === 'referenceLink';

  return (
    <div className="space-y-3">
      {displayValues.map((value, index) => (
        <div key={index} className="flex gap-2 items-start">
          {isReferenceLink && (
            <Link size={16} className="text-luxury-gold mt-2 flex-shrink-0" />
          )}
          <input
            placeholder={config.placeholder || `请输入${config.label}`}
            value={value}
            onChange={e => handleChange(index, e.target.value)}
            className="flex-1 bg-transparent text-base outline-none border-b border-luxury-text/10 focus:border-luxury-gold transition-colors py-2"
          />
          {displayValues.length > 1 && (
            <button
              onClick={() => handleRemove(index)}
              className="p-1 text-luxury-text/40 hover:text-red-800 transition-colors flex-shrink-0"
            >
              <CloseIcon size={14} />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={handleAdd}
        className="text-xs uppercase tracking-widest text-luxury-gold hover:text-luxury-text transition-colors flex items-center gap-2"
      >
        <span>+ 添加{config.label}</span>
      </button>
    </div>
  );
};

// Markdown 输入
export const MarkdownInput: React.FC<{ config: FieldConfig; value: string; onChange: (value: string) => void }> = ({ config, value, onChange }) => {
  return (
    <div>
      <textarea
        placeholder={config.placeholder || `请输入${config.label}（支持 Markdown）`}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        rows={6}
        className="w-full bg-luxury-paper/20 text-base outline-none border border-luxury-text/10 focus:border-luxury-gold transition-colors p-4 resize-none font-mono leading-relaxed"
      />
      <p className="text-xs text-luxury-muted/60 mt-2">
        支持 **加粗**、[链接](url)、换行等 Markdown 语法
      </p>
    </div>
  );
};

// 图片输入
export const ImageInput: React.FC<{ config: FieldConfig; value: string; imageData?: Blob; onChange: (value: string, imageData?: Blob) => void }> = ({ config, value, imageData, onChange }) => {
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (imageData instanceof Blob) {
      const url = URL.createObjectURL(imageData);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setObjectUrl(null);
    }
  }, [imageData]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange('', file);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value, undefined);
  };

  const displayImage = objectUrl || value;

  return (
    <div className="space-y-4">
      {/* 图片预览 */}
      {displayImage && (
        <div className="w-full aspect-video bg-luxury-paper/20 border border-luxury-text/10 overflow-hidden relative group">
          <img
            src={displayImage}
            alt={config.label}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => onChange('', undefined)}
            className="absolute top-2 right-2 p-1 bg-red-800 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <CloseIcon size={12} />
          </button>
        </div>
      )}

      {/* URL 输入 */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={value || ''}
          onChange={handleUrlChange}
          placeholder="或输入远程图片地址 (URL)"
          className="flex-1 bg-transparent text-xs uppercase tracking-widest outline-none border-b border-luxury-text/10 focus:border-luxury-gold transition-colors"
        />
      </div>

      {/* 本地上传 */}
      <label className="cursor-pointer text-xs uppercase tracking-widest font-bold bg-luxury-gold/10 text-luxury-gold px-4 py-2 hover:bg-luxury-gold hover:text-luxury-bg transition-all flex items-center gap-2 w-fit">
        <Upload size={12} />
        {displayImage ? '替换图片' : `上传${config.label}`}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </label>
    </div>
  );
};

// 主字段输入组件（根据类型路由到不同的输入组件）
export const FieldInput: React.FC<FieldInputProps> = ({ config, value, onChange, word }) => {
  switch (config.type) {
    case 'text':
      return <TextInput config={config} value={value || ''} onChange={onChange} />;

    case 'textarea':
      return <TextareaInput config={config} value={value || ''} onChange={onChange} />;

    case 'tags':
      return <TagsInput config={config} values={value || []} onChange={onChange} />;

    case 'markdown':
      return <MarkdownInput config={config} value={value || ''} onChange={onChange} />;

    case 'image':
      return <ImageInput config={config} value={value || ''} imageData={word?.imageData} onChange={onChange} />;

    default:
      return null;
  }
};
