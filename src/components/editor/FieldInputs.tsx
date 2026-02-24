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

// 图片输入 (支持多图)
export const ImageInput: React.FC<{ 
  config: FieldConfig; 
  value: string; 
  imageData?: Blob;
  images?: string[];
  imagesData?: Blob[];
  onChange: (value: string, imageData?: Blob, images?: string[], imagesData?: Blob[]) => void 
}> = ({ config, value, imageData, images = [], imagesData = [], onChange }) => {
  const [objectUrls, setObjectUrls] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 综合处理单图（旧数据）和多图（新数据）
  const allImages = React.useMemo(() => {
    const list: { url?: string; data?: Blob }[] = [];
    
    // 处理多图数据
    const maxLen = Math.max(images.length, imagesData.length);
    for (let i = 0; i < maxLen; i++) {
      list.push({ url: images[i], data: imagesData[i] });
    }
    
    // 如果没有多图但有单图（兼容旧数据），则将单图加入列表
    if (list.length === 0 && (value || imageData)) {
      list.push({ url: value, data: imageData });
    }
    
    return list;
  }, [value, imageData, JSON.stringify(images), (imagesData || []).map(d => d instanceof Blob ? `${d.size}_${d.type}` : '').join('|')]);

  React.useEffect(() => {
    const urls = allImages.map(img => {
      if (img.data instanceof Blob) {
        return URL.createObjectURL(img.data);
      }
      return img.url || '';
    });
    setObjectUrls(urls);
    return () => urls.forEach(url => {
      if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
    });
  }, [allImages]);

  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // 保持现有的多图数据，并添加新选择的文件
      const newImagesData = [...imagesData, ...files];
      // 清空单图旧数据以避免混淆
      onChange('', undefined, images, newImagesData);
    }
  };

  const handleUrlAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const url = e.currentTarget.value.trim();
      if (url) {
        const newImages = [...images, url];
        onChange('', undefined, newImages, imagesData);
        e.currentTarget.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    // 如果是旧的单图数据
    if (images.length === 0 && imagesData.length === 0 && (value || imageData)) {
      onChange('', undefined, [], []);
      return;
    }

    const newImages = [...images];
    const newImagesData = [...imagesData];
    
    // 逻辑：如果 index 对应 imagesData，则移除；否则看是否对应 images
    // 实际上我们在 allImages 构造时是按最大长度合并的。
    // 为了简单起见，如果 index 在 imagesData 范围内则移除，否则在 images 范围内移除
    if (index < imagesData.length) {
      newImagesData.splice(index, 1);
    } else {
      newImages.splice(index - imagesData.length, 1);
    }
    
    onChange('', undefined, newImages, newImagesData);
  };

  return (
    <div className="space-y-4">
      {/* 图片列表预览 */}
      {objectUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {objectUrls.map((url, idx) => (
            url ? (
              <div key={idx} className="aspect-video bg-luxury-paper/20 border border-luxury-text/10 overflow-hidden relative group">
                <img
                  src={url}
                  alt={`${config.label} ${idx + 1}`}
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-1 bg-red-800 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <CloseIcon size={10} />
                </button>
              </div>
            ) : null
          ))}
        </div>
      )}

      {/* URL 输入 */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          onKeyDown={handleUrlAdd}
          placeholder="输入远程图片地址并回车添加"
          className="flex-1 bg-transparent text-xs uppercase tracking-widest outline-none border-b border-luxury-text/10 focus:border-luxury-gold transition-colors py-1"
        />
      </div>

      {/* 本地上传 */}
      <div className="flex flex-col gap-2">
        <label className="cursor-pointer text-xs uppercase tracking-widest font-bold bg-luxury-gold/10 text-luxury-gold px-4 py-2 hover:bg-luxury-gold hover:text-luxury-bg transition-all flex items-center gap-2 w-fit">
          <Upload size={12} />
          {objectUrls.length > 0 ? '添加更多图片' : `上传${config.label}`}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,image/gif,.gif"
            className="hidden"
            onChange={handleFilesSelect}
          />
        </label>
        <p className="text-[10px] text-luxury-muted/60">支持多选上传，支持 JPG、PNG、GIF 格式</p>
      </div>
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
      return (
        <ImageInput 
          config={config} 
          value={value || ''} 
          imageData={word?.imageData} 
          images={word?.images}
          imagesData={word?.imagesData}
          onChange={(v, d, imgs, dimgs) => {
            // 这里我们调用父组件传来的 onChange，它可能需要特殊处理多图
            // 在 VocabularyForm 中，我们会把这些参数封装起来
            (onChange as any)(v, d, imgs, dimgs);
          }}
        />
      );

    default:
      return null;
  }
};
