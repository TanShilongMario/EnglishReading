import { db, ContextualExample, Paragraph, Project } from '../api/db';

export interface SentenceMatch {
  text: string;
  projectId: number;
  sourceTitle: string;
  paragraphId: number;
}

export class SentenceService {
  /**
   * 健壮的英文/中文分句逻辑
   */
  private static splitIntoSentences(text: string): string[] {
    if (!text) return [];
    // 匹配标点符号：. ! ? 。 ！ ？ 后面跟着空格或直接结束
    // 避免简写（如 Mr. ）的复杂逻辑暂不实现，优先保证完整性
    return text
      .split(/([.!?。！？]\s*)/g)
      .reduce((acc: string[], cur, i) => {
        if (i % 2 === 0) {
          acc.push(cur);
        } else {
          acc[acc.length - 1] += cur;
        }
        return acc;
      }, [])
      .map(s => s.trim())
      .filter(s => s.length > 5); // 过滤掉太短的片段
  }

  /**
   * 搜索全库中包含关键词的句子
   */
  static async searchContextualSentences(
    word: string, 
    matchPattern?: string, 
    excludeParagraphId?: number
  ): Promise<SentenceMatch[]> {
    const allProjects = await db.projects.toArray();
    const projectMap = new Map(allProjects.map(p => [p.id, p.title]));
    
    const allParagraphs = await db.paragraphs.toArray();
    const results: SentenceMatch[] = [];

    // 准备搜索正则
    const patterns = [word, ...(matchPattern?.split(/[,，]/).map(p => p.trim()) || [])]
      .filter(Boolean)
      .map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); // 转义
    
    const regex = new RegExp(`\\b(${patterns.join('|')})\\b`, 'gi');

    for (const para of allParagraphs) {
      if (para.id === excludeParagraphId) continue;

      const sentences = this.splitIntoSentences(para.content);
      for (const sentence of sentences) {
        if (regex.test(sentence)) {
          results.push({
            text: sentence,
            projectId: para.projectId,
            sourceTitle: projectMap.get(para.projectId) || 'Unknown Article',
            paragraphId: para.id!
          });
        }
      }
    }

    // 简单去重
    const seen = new Set();
    return results.filter(item => {
      const k = item.text.toLowerCase();
      return seen.has(k) ? false : seen.add(k);
    });
  }
}
