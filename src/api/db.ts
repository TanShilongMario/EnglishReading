import Dexie, { Table } from 'dexie';

// ----------------------------------------------------------------------------
// 数据库稳定化配置
// ----------------------------------------------------------------------------
const DB_NAME = 'EnglishReadingDB_v7'; // 这是当前稳定的数据库名，未来请勿在此更改版本号，应通过 Dexie 的 version() 升级
const LEGACY_DB_NAMES = ['EnglishReadingDB_v3', 'EnglishReadingDB_v5'];

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
    super(DB_NAME); 

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
 * 跨数据库自动迁移工具
 * 检查是否存在旧名称的数据库，并将其数据导入当前数据库
 */
async function migrateFromLegacyDatabases(): Promise<void> {
  for (const legacyName of LEGACY_DB_NAMES) {
    try {
      const exists = await Dexie.exists(legacyName);
      if (!exists) continue;

      console.log(`🔍 发现旧版数据库: ${legacyName}，正在尝试自动迁移数据...`);
      
      const legacyDb = new Dexie(legacyName);
      // 根据旧版可能存在的 schema 动态定义
      legacyDb.version(1).stores({
        projects: '++id, title, createdAt',
        paragraphs: '++id, projectId, order',
        vocabulary: '++id, paragraphId, word'
      });

      await legacyDb.open();

      const projects = await legacyDb.table('projects').toArray();
      if (projects.length === 0) {
        await legacyDb.close();
        continue;
      }

      // 导入逻辑
      await db.transaction('rw', [db.projects, db.paragraphs, db.vocabulary], async () => {
        for (const p of projects) {
          // 检查当前 DB 是否已存在同名项目（防止重复迁移）
          const alreadyExists = await db.projects.where('title').equals(p.title).first();
          if (alreadyExists) continue;

          const oldId = p.id;
          delete p.id; // 让新 DB 生成新 ID
          const newProjectId = await db.projects.add(p);

          const paragraphs = await legacyDb.table('paragraphs').where('projectId').equals(oldId).toArray();
          for (const para of paragraphs) {
            const oldParaId = para.id;
            delete para.id;
            para.projectId = newProjectId as number;
            const newParaId = await db.paragraphs.add(para);

            const vocabs = await legacyDb.table('vocabulary').where('paragraphId').equals(oldParaId).toArray();
            for (const v of vocabs) {
              delete v.id;
              v.paragraphId = newParaId as number;
              await db.vocabulary.add(v);
            }
          }
        }
      });

      console.log(`✅ 从 ${legacyName} 迁移数据成功！`);
      await legacyDb.close();
      
      // 迁移成功后建议删除旧库，避免重复提醒，但为了安全也可以保留
      // await Dexie.delete(legacyName); 
    } catch (err) {
      console.error(`❌ 从 ${legacyName} 迁移数据失败:`, err);
    }
  }
}

/**
 * 数据库迁移工具
 * 在应用启动时调用，确保数据兼容性
 */
export async function migrateDatabase(): Promise<void> {
  // 1. 先尝试从完全不同名称的旧数据库迁移
  await migrateFromLegacyDatabases();

  // 2. 处理当前数据库的内部版本升级
  const currentVersion = await db.verno;
  const targetVersion = 7;

  if (currentVersion < targetVersion) {
    console.log(`⚠️  检测到旧版本数据库结构 v${currentVersion}`);
    console.log(`📦 正在升级到 v${targetVersion}，请勿关闭页面...`);
    await db.open();
    console.log('✅ 数据库升级完成！');
  }

  return db.open();
}
