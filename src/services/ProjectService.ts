import { db, Project, Paragraph } from '../api/db';

/**
 * 项目服务层
 * 封装所有项目相关的业务逻辑
 */
export class ProjectService {
  /**
   * 创建新项目
   */
  async createProject(title: string): Promise<number> {
    const id = await db.projects.add({
      title,
      createdAt: Date.now()
    });
    return id as number;
  }

  /**
   * 更新项目标题
   */
  async updateProject(id: number, title: string): Promise<void> {
    await db.projects.update(id, { title });
  }

  /**
   * 获取单个项目
   */
  async getProject(id: number): Promise<Project | undefined> {
    return await db.projects.get(id);
  }

  /**
   * 获取所有项目
   */
  async getAllProjects(): Promise<Project[]> {
    return await db.projects.toArray();
  }

  /**
   * 删除项目（级联删除段落和词汇）
   */
  async deleteProject(id: number): Promise<void> {
    // 使用事务确保数据一致性
    await db.transaction(
      'rw',
      db.projects,
      db.paragraphs,
      db.vocabulary,
      async () => {
        // 1. 获取所有段落
        const paragraphs = await db.paragraphs.where('projectId').equals(id).toArray();

        // 2. 删除每个段落的词汇
        for (const para of paragraphs) {
          await db.vocabulary.where('paragraphId').equals(para.id!).delete();
        }

        // 3. 删除所有段落
        await db.paragraphs.where('projectId').equals(id).delete();

        // 4. 删除项目
        await db.projects.delete(id);
      }
    );
  }

  /**
   * 获取项目的所有段落（按 order 排序）
   */
  async getParagraphs(projectId: number): Promise<Paragraph[]> {
    return await db.paragraphs
      .where('projectId')
      .equals(projectId)
      .sortBy('order');
  }

  /**
   * 添加新段落
   */
  async addParagraph(projectId: number, order: number): Promise<number> {
    const id = await db.paragraphs.add({
      projectId,
      content: '',
      order,
    });
    return id as number;
  }

  /**
   * 更新段落
   */
  async updateParagraph(id: number, data: Partial<Paragraph>): Promise<void> {
    await db.paragraphs.update(id, data);
  }

  /**
   * 删除段落（级联删除词汇）
   */
  async deleteParagraph(id: number): Promise<void> {
    await db.transaction('rw', db.paragraphs, db.vocabulary, async () => {
      // 删除段落的词汇
      await db.vocabulary.where('paragraphId').equals(id).delete();
      // 删除段落
      await db.paragraphs.delete(id);
    });
  }

  /**
   * 导出项目为 JSON
   */
  async exportProject(id: number): Promise<string> {
    const project = await this.getProject(id);
    const paragraphs = await this.getParagraphs(id);

    // 获取每个段落的词汇
    const paragraphsVocab = await Promise.all(
      paragraphs.map(async (para) => ({
        ...para,
        vocabulary: await db.vocabulary.where('paragraphId').equals(para.id!).toArray()
      }))
    );

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      project,
      paragraphs: paragraphsVocab
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 从 JSON 导入项目
   */
  async importProject(jsonString: string): Promise<number> {
    const data = JSON.parse(jsonString);

    // 创建项目
    const projectId = await this.createProject(data.project.title);

    // 导入段落和词汇
    for (const para of data.paragraphs) {
      const { vocabulary, ...paraData } = para;

      // 添加段落
      const paragraphId = await db.paragraphs.add({
        ...paraData,
        projectId,
      } as Paragraph);

      // 添加词汇
      for (const vocab of vocabulary) {
        await db.vocabulary.add({
          ...vocab,
          paragraphId: paragraphId as number
        });
      }
    }

    return projectId;
  }
}

// 导出单例
export const projectService = new ProjectService();
