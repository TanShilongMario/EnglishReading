import Dexie, { Table } from 'dexie';

// ----------------------------------------------------------------------------
// 数据库稳定化配置
// ----------------------------------------------------------------------------
const DB_NAME = 'EnglishReadingDB_v7'; 
// 扫描所有可能的旧版本库名
const LEGACY_DB_NAMES = [
  'EnglishReadingDB',
  'EnglishReadingDB_v1',
  'EnglishReadingDB_v2',
  'EnglishReadingDB_v3',
  'EnglishReadingDB_v4',
  'EnglishReadingDB_v5',
  'EnglishReadingDB_v6'
];

export interface Project {
  id?: number;
  title: string;
  author?: string;
  templateId?: string;
  coverImage?: string;
  coverImageData?: Blob;
  isSample?: boolean;
  createdAt: number;
}

export interface Paragraph {
  id?: number;
  projectId: number;
  content: string;
  image?: string;
  imageData?: Blob;
  images?: string[];              // 多图 URL
  imagesData?: Blob[];            // 多图本地数据
  order: number;
  excludedWords?: string[];
}

export interface ContextualExample {
  text: string;
  sourceTitle: string;
  projectId: number;
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
  images?: string[];              // 多图 URL
  imagesData?: Blob[];            // 多图本地数据
  contextualExamples?: ContextualExample[]; // 新增：来自其他文章的选中的语境例句
}

export class AppDatabase extends Dexie {
  projects!: Table<Project>;
  paragraphs!: Table<Paragraph>;
  vocabulary!: Table<Vocabulary>;

  constructor() {
    super(DB_NAME); 

    this.version(1).stores({
      projects: '++id, title, createdAt',
      paragraphs: '++id, projectId, order',
      vocabulary: '++id, paragraphId, word'
    });

    this.version(2).stores({
      projects: '++id, title, createdAt',
      paragraphs: '++id, projectId, order',
      vocabulary: '++id, paragraphId, word, color'
    }).upgrade(async (trans) => {
      await trans.vocabulary.toCollection().modify(vocab => {
        if (!vocab.color) vocab.color = '#E2B933';
      });
    });

    this.version(3).stores({
      projects: '++id, title, createdAt, isSample',
      paragraphs: '++id, projectId, order',
      vocabulary: '++id, paragraphId, word, color'
    });

    this.version(5).stores({
      projects: '++id, title, createdAt, isSample',
      paragraphs: '++id, projectId, order',
      vocabulary: '++id, paragraphId, word, color'
    });

    this.version(6).stores({
      projects: '++id, title, createdAt, isSample, templateId',
      paragraphs: '++id, projectId, order',
      vocabulary: '++id, paragraphId, word, color'
    }).upgrade(async (trans) => {
      await trans.projects.toCollection().modify(project => {
        if (!project.templateId) project.templateId = 'english-reading';
      });
    });

    this.version(7).stores({
      projects: '++id, title, createdAt, isSample, templateId, author',
      paragraphs: '++id, projectId, order',
      vocabulary: '++id, paragraphId, word, color'
    });

    // 版本 9: 支持多图
    this.version(9).stores({
      projects: '++id, title, createdAt, isSample, templateId, author',
      paragraphs: '++id, projectId, order',
      vocabulary: '++id, paragraphId, word, color'
    }).upgrade(async (trans) => {
      // 迁移旧的单图数据到多图数组（可选，因为逻辑上可以兼容处理）
    });
  }
}

export const db = new AppDatabase();

/**
 * 终极救灾迁移工具
 * 扫描所有旧库，将所有内容搬运至新库，绝不跳过任何数据
 */
async function migrateFromLegacyDatabases(): Promise<void> {
  for (const legacyName of LEGACY_DB_NAMES) {
    try {
      const exists = await Dexie.exists(legacyName);
      if (!exists || legacyName === DB_NAME) continue;

      console.log(`🚀 [救灾] 发现旧库: ${legacyName}，启动深度打捞...`);
      
      const legacyDb = new Dexie(legacyName);
      // 动态打开，不限制 schema
      await legacyDb.open();

      const oldProjects = await legacyDb.table('projects').toArray();
      const oldParagraphs = await legacyDb.table('paragraphs').toArray();
      const oldVocabularies = await legacyDb.table('vocabulary').toArray();
      
      await legacyDb.close();

      if (oldProjects.length === 0) continue;

      await db.transaction('rw', [db.projects, db.paragraphs, db.vocabulary], async () => {
        for (const p of oldProjects) {
          const oldProjectId = p.id;
          
          // 检查是否已经完全一致地搬运过（根据创建时间判断，而不是标题）
          const alreadyMigrated = await db.projects
            .where('createdAt').equals(p.createdAt)
            .and(x => x.title === p.title)
            .first();
          
          if (alreadyMigrated) {
            // 如果已存在且有内容，则跳过
            const hasContent = await db.paragraphs.where('projectId').equals(alreadyMigrated.id!).count();
            if (hasContent > 0) continue;
          }

          // 执行搬运
          const oldId = p.id;
          delete p.id;
          
          // 标记为恢复数据，防止与新版示例冲突
          if (p.isSample) {
            p.title = `${p.title} (Legacy Backup)`;
            p.isSample = false; 
          }

          const newProjectId = await db.projects.add(p) as number;

          const relatedParas = oldParagraphs.filter(para => para.projectId === oldId);
          for (const para of relatedParas) {
            const oldParaId = para.id;
            delete para.id;
            para.projectId = newProjectId;
            const newParaId = await db.paragraphs.add(para) as number;

            const relatedVocabs = oldVocabularies.filter(v => v.paragraphId === oldParaId);
            for (const v of relatedVocabs) {
              delete v.id;
              v.paragraphId = newParaId;
              await db.vocabulary.add(v);
            }
          }
        }
      });

      console.log(`✅ [救灾] 来自 ${legacyName} 的数据已安全同步！`);
      // 成功后删除旧库，释放空间并防止重复迁移
      await Dexie.delete(legacyName);
    } catch (err) {
      console.warn(`⚠️ [救灾] 跳过旧库 ${legacyName}:`, err);
    }
  }
}

export async function migrateDatabase(): Promise<void> {
  await migrateFromLegacyDatabases();

  const currentVersion = await db.verno;
  const targetVersion = 9;

  if (currentVersion < targetVersion) {
    await db.open();
  }

  return db.open();
}
