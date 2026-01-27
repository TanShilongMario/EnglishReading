import { db, Vocabulary } from '../api/db';

/**
 * 词汇服务层
 * 封装所有词汇相关的业务逻辑
 */
export class VocabularyService {
  /**
   * 获取段落的所有词汇
   */
  async getVocabularyByParagraph(paragraphId: number): Promise<Vocabulary[]> {
    return await db.vocabulary.where('paragraphId').equals(paragraphId).toArray();
  }

  /**
   * 获取项目的所有词汇（跨段落）
   */
  async getVocabularyByProject(projectId: number): Promise<Vocabulary[]> {
    // 1. 获取项目的所有段落 ID
    const paragraphs = await db.paragraphs
      .where('projectId')
      .equals(projectId)
      .toArray();

    const paragraphIds = paragraphs.map(p => p.id!);

    // 2. 获取所有段落的词汇
    if (paragraphIds.length === 0) return [];

    return await db.vocabulary.where('paragraphId').anyOf(paragraphIds).toArray();
  }

  /**
   * 搜索词汇（支持单词和释义搜索）
   */
  async searchVocabulary(query: string): Promise<Vocabulary[]> {
    const lowerQuery = query.toLowerCase();

    // 搜索单词和释义
    const results = await db.vocabulary
      .filter(vocab =>
        vocab.word.toLowerCase().includes(lowerQuery) ||
        vocab.translation.toLowerCase().includes(lowerQuery)
      )
      .toArray();

    return results;
  }

  /**
   * 获取段落的所有词汇（包含本地和全局共享词汇）
   */
  async getSmartVocabulary(paragraphId: number): Promise<(Vocabulary & { isGlobal?: boolean })[]> {
    const paragraph = await db.paragraphs.get(paragraphId);
    if (!paragraph) return [];

    // 1. 获取本地词汇
    const localVocab = await db.vocabulary.where('paragraphId').equals(paragraphId).toArray();
    const localWords = new Set(localVocab.map(v => v.word.toLowerCase()));

    // 2. 获取所有全局共享词汇（非本地段落的）
    // 为了性能，我们只取单词不重复的最新定义
    const allVocab = await db.vocabulary.toArray();
    const excludedWords = new Set((paragraph.excludedWords || []).map(w => w.toLowerCase()));

    const globalVocabMap = new Map<string, Vocabulary>();
    allVocab.forEach(v => {
      const wordLower = v.word.toLowerCase();
      // 排除逻辑：
      // - 不是本地已有的单词
      // - 不在排除列表里的单词
      // - 只保留每个单词最新的定义（假设 ID 越大越新）
      if (!localWords.has(wordLower) && !excludedWords.has(wordLower)) {
        if (!globalVocabMap.has(wordLower) || (v.id! > globalVocabMap.get(wordLower)!.id!)) {
          globalVocabMap.set(wordLower, v);
        }
      }
    });

    const globalVocab = Array.from(globalVocabMap.values()).map(v => ({
      ...v,
      isGlobal: true
    }));

    return [...localVocab, ...globalVocab];
  }

  /**
   * 将单词添加到段落的排除列表
   */
  async excludeWordFromParagraph(paragraphId: number, word: string): Promise<void> {
    const paragraph = await db.paragraphs.get(paragraphId);
    if (!paragraph) return;

    const excludedWords = paragraph.excludedWords || [];
    if (!excludedWords.includes(word)) {
      await db.paragraphs.update(paragraphId, {
        excludedWords: [...excludedWords, word]
      });
    }
  }

  /**
   * 从段落排除列表中移除单词
   */
  async includeWordInParagraph(paragraphId: number, word: string): Promise<void> {
    const paragraph = await db.paragraphs.get(paragraphId);
    if (!paragraph) return;

    const excludedWords = paragraph.excludedWords || [];
    await db.paragraphs.update(paragraphId, {
      excludedWords: excludedWords.filter(w => w !== word)
    });
  }

  /**
   * 保存或更新词汇
   */
  async saveVocabulary(vocab: Omit<Vocabulary, 'id'> & { id?: number }): Promise<number> {
    const id = await db.vocabulary.put(vocab as Vocabulary);
    return id as number;
  }

  /**
   * 删除词汇
   */
  async deleteVocabulary(id: number): Promise<void> {
    await db.vocabulary.delete(id);
  }

  /**
   * 批量删除段落的词汇
   */
  async deleteVocabularyByParagraph(paragraphId: number): Promise<void> {
    await db.vocabulary.where('paragraphId').equals(paragraphId).delete();
  }

  /**
   * 获取词汇统计
   */
  async getVocabularyStats(projectId: number): Promise<{
    totalWords: number;
    uniqueWords: number;
    paragraphCount: number;
  }> {
    const vocabList = await this.getVocabularyByProject(projectId);
    const paragraphs = await db.paragraphs.where('projectId').equals(projectId).toArray();

    // 去重统计（按单词）
    const uniqueWords = new Set(vocabList.map(v => v.word.toLowerCase()));

    return {
      totalWords: vocabList.length,
      uniqueWords: uniqueWords.size,
      paragraphCount: paragraphs.length,
    };
  }

  /**
   * 导出单词本为 CSV
   */
  async exportToCSV(projectId: number): Promise<string> {
    const vocabList = await this.getVocabularyByProject(projectId);

    // CSV 表头
    const headers = ['单词', '音标', '词性', '英文释义', '中文释义', '例句'];

    // 转换为 CSV 行
    const rows = vocabList.map(v => [
      v.word,
      v.phonetic,
      v.partOfSpeech || '',
      v.definition,
      v.translation,
      v.examples.join('; ')
    ]);

    // 组合 CSV
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csv;
  }
}

// 导出单例
export const vocabularyService = new VocabularyService();
