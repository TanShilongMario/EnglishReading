import Dexie, { Table } from 'dexie';

export interface Project {
  id?: number;
  title: string;
  author?: string;        // 作者字段（可选）
  templateId?: string;    // 新增：模板ID（默认 'english-reading'）
  coverImage?: string;    // 新增：项目封面图 URL
  coverImageData?: Blob;  // 新增：项目封面图本地数据
  isSample?: boolean;     // 新增：标记是否为示例数据
  createdAt: number;
}

export interface Paragraph {
  id?: number;
  projectId: number;
  content: string;
  image?: string;      // 保持对 URL 的支持
  imageData?: Blob;    // 新增：支持本地上传的图片数据
  order: number;
  excludedWords?: string[]; // 新增：当前段落排除的全局共享单词
}

export interface Vocabulary {
  id?: number;
  paragraphId: number;
  word: string;

  // 英语精读字段
  phonetic?: string;
  partOfSpeech?: string;
  matchPattern?: string;
  definition?: string;
  translation?: string;
  examples?: string[];

  // 读书知识笔记字段
  explanation?: string;           // 名词解释
  extendedReading?: string;       // 扩展阅读（支持 Markdown）
  referenceLink?: string[];       // 参考链接
  relatedConcepts?: string[];     // 相关概念
  sourceReference?: string;       // 原文参考（页码、章节）

  // 通用字段
  color?: string;                 // 自定义高亮颜色
  image?: string;                 // 词汇图片 URL
  imageData?: Blob;               // 词汇图片本地数据
}

export class AppDatabase extends Dexie {
  projects!: Table<Project>;
  paragraphs!: Table<Paragraph>;
  vocabulary!: Table<Vocabulary>;

  constructor() {
    super('EnglishReadingDB_v7'); // 升级到 v7（添加作者字段）

    // 版本 1: 原始 schema
    this.version(1).stores({
      projects: '++id, title, createdAt',
      paragraphs: '++id, projectId, order',
      vocabulary: '++id, paragraphId, word'
    });

    // 版本 2: 添加 color 字段
    this.version(2).stores({
      projects: '++id, title, createdAt',
      paragraphs: '++id, projectId, order',
      vocabulary: '++id, paragraphId, word, color'
    }).upgrade(async (trans) => {
      await trans.vocabulary.toCollection().modify(vocab => {
        if (!vocab.color) vocab.color = '#E2B933';
      });
    });

    // 版本 3: 添加 isSample 索引
    this.version(3).stores({
      projects: '++id, title, createdAt, isSample',
      paragraphs: '++id, projectId, order',
      vocabulary: '++id, paragraphId, word, color'
    });

    // 版本 5: 优化结构（保持一致）
    this.version(5).stores({
      projects: '++id, title, createdAt, isSample',
      paragraphs: '++id, projectId, order',
      vocabulary: '++id, paragraphId, word, color'
    });

    // 版本 6: 添加模板系统支持
    this.version(6).stores({
      projects: '++id, title, createdAt, isSample, templateId',
      paragraphs: '++id, projectId, order',
      vocabulary: '++id, paragraphId, word, color'
    }).upgrade(async (trans) => {
      // 为现有项目设置默认模板
      await trans.projects.toCollection().modify(project => {
        if (!project.templateId) project.templateId = 'english-reading';
      });
    });

    // 版本 7: 添加作者字段
    this.version(7).stores({
      projects: '++id, title, createdAt, isSample, templateId, author',
      paragraphs: '++id, projectId, order',
      vocabulary: '++id, paragraphId, word, color'
    });
  }
}

export const db = new AppDatabase();

/**
 * 数据库迁移工具
 * 在应用启动时调用，确保数据兼容性
 */
export async function migrateDatabase(): Promise<void> {
  const currentVersion = await db.verno;
  const targetVersion = 7;

  if (currentVersion < targetVersion) {
    console.log(`⚠️  检测到旧版本数据库 v${currentVersion}`);
    console.log(`📦 正在迁移到 v${targetVersion}，请勿关闭页面...`);
    await db.open();
    console.log('✅ 数据库迁移完成！');
  }

  return db.open();
}
