import Dexie, { Table } from 'dexie';

export interface Project {
  id?: number;
  title: string;
  createdAt: number;
}

export interface Paragraph {
  id?: number;
  projectId: number;
  content: string;
  image?: string;      // 保持对 URL 的支持
  imageData?: Blob;    // 新增：支持本地上传的图片数据
  order: number;
}

export interface Vocabulary {
  id?: number;
  paragraphId: number; 
  word: string;
  phonetic: string;
  partOfSpeech?: string; // 新增：词性
  matchPattern?: string; // 新增：匹配模式（支持逗号分隔的变形词）
  definition: string;
  translation: string;
  examples: string[];
}

export class AppDatabase extends Dexie {
  projects!: Table<Project>;
  paragraphs!: Table<Paragraph>;
  vocabulary!: Table<Vocabulary>;

  constructor() {
    super('EnglishReadingDB_v3'); // 升级数据库版本
    this.version(1).stores({
      projects: '++id, title, createdAt',
      paragraphs: '++id, projectId, order',
      vocabulary: '++id, paragraphId, word'
    });
  }
}

export const db = new AppDatabase();
