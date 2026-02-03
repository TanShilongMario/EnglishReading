/**
 * 词条模板系统配置
 * 定义不同类型项目的字段配置和展示形式
 */

// 字段类型定义
export type FieldType = 'text' | 'textarea' | 'tags' | 'markdown' | 'image';

// 字段配置
export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  displayConfig?: {
    fontSize?: 'sm' | 'base' | 'lg' | 'xl';
    fontStyle?: 'normal' | 'italic' | 'serif';
    showIcon?: boolean;
    icon?: string;
  };
}

// 词条卡片布局配置
export interface CardLayout {
  headerFields: string[];      // 卡片顶部显示的字段
  bodyFields: string[];        // 主要内容区
  footerFields?: string[];     // 底部区域
}

// 高亮样式配置
export interface HighlightStyle {
  defaultColor: string;
  allowCustomColor: boolean;
}

// 模板定义
export interface EntryTemplate {
  id: string;
  name: string;
  description: string;
  category: 'language' | 'knowledge' | 'professional';

  // 字段配置
  fields: FieldConfig[];

  // 词条卡片布局
  cardLayout: CardLayout;

  // 高亮样式
  highlightStyle: HighlightStyle;
}

// 预设模板
export const TEMPLATES: Record<string, EntryTemplate> = {
  // 英语精读模板（现有实现）
  'english-reading': {
    id: 'english-reading',
    name: '英语精读',
    description: '适用于英语文章精读，词汇学习',
    category: 'language',
    fields: [
      {
        key: 'word',
        label: '单词',
        type: 'text',
        required: true,
      },
      {
        key: 'matchPattern',
        label: '匹配模式',
        type: 'text',
        required: false,
        placeholder: '变形词，用逗号分隔（如：erupted, erupts）；支持跨词索引（如：explain...in）',
      },
      {
        key: 'phonetic',
        label: '音标',
        type: 'text',
        required: false,
      },
      {
        key: 'partOfSpeech',
        label: '词性',
        type: 'text',
        required: false,
        placeholder: '如：n., v., adj.',
      },
      {
        key: 'definition',
        label: '英文释义',
        type: 'textarea',
        required: true,
        displayConfig: {
          fontSize: 'lg',
          fontStyle: 'italic',
        },
      },
      {
        key: 'translation',
        label: '中文释义',
        type: 'text',
        required: true,
        displayConfig: {
          fontSize: 'lg',
        },
      },
      {
        key: 'examples',
        label: '例句',
        type: 'tags',
        required: false,
        placeholder: '每行一个例句',
      },
      {
        key: 'image',
        label: '配图',
        type: 'image',
        required: false,
      },
    ],
    cardLayout: {
      headerFields: ['word', 'phonetic', 'partOfSpeech'],
      bodyFields: ['definition', 'translation', 'examples', 'image'],
    },
    highlightStyle: {
      defaultColor: '#E2B933',
      allowCustomColor: true,
    },
  },

  // 读书知识笔记模板
  'knowledge-notes': {
    id: 'knowledge-notes',
    name: '读书知识笔记',
    description: '适用于知识性书籍的术语解释、概念梳理',
    category: 'knowledge',
    fields: [
      {
        key: 'word',
        label: '术语/概念',
        type: 'text',
        required: true,
      },
      {
        key: 'matchPattern',
        label: '匹配模式',
        type: 'text',
        required: false,
        placeholder: '相关表述，用逗号分隔；支持跨词索引（如：concept...relation）',
      },
      {
        key: 'explanation',
        label: '名词解释',
        type: 'textarea',
        required: true,
        displayConfig: {
          fontSize: 'base',
        },
      },
      {
        key: 'extendedReading',
        label: '扩展阅读',
        type: 'markdown',
        required: false,
        placeholder: '支持 Markdown 格式，可添加链接、列表等',
      },
      {
        key: 'referenceLink',
        label: '参考链接',
        type: 'tags',
        required: false,
        placeholder: '每行一个链接',
      },
      {
        key: 'relatedConcepts',
        label: '相关概念',
        type: 'tags',
        required: false,
        placeholder: '每行一个相关概念',
      },
      {
        key: 'sourceReference',
        label: '原文参考',
        type: 'text',
        required: false,
        placeholder: '页码、章节等',
      },
      {
        key: 'image',
        label: '配图',
        type: 'image',
        required: false,
      },
    ],
    cardLayout: {
      headerFields: ['word'],
      bodyFields: ['explanation', 'extendedReading', 'referenceLink', 'relatedConcepts', 'sourceReference', 'image'],
    },
    highlightStyle: {
      defaultColor: '#D4AF37',
      allowCustomColor: true,
    },
  },
};

// 获取默认模板
export const DEFAULT_TEMPLATE = 'english-reading';

// 根据模板ID获取模板
export const getTemplate = (templateId: string): EntryTemplate => {
  return TEMPLATES[templateId] || TEMPLATES[DEFAULT_TEMPLATE];
};

// 获取所有模板列表
export const getTemplateList = (): EntryTemplate[] => {
  return Object.values(TEMPLATES);
};
