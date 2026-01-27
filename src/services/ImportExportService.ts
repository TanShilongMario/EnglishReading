import { db, Project, Paragraph, Vocabulary } from '../api/db';

export interface ExportData {
  version: string;
  timestamp: number;
  projects: Array<{
    project: Project;
    paragraphs: Array<Paragraph & { 
      vocabulary: Vocabulary[];
      imageBase64?: string;
    }>;
    coverImageBase64?: string;
  }>;
}

export class ImportExportService {
  private static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private static async base64ToBlob(base64: string): Promise<Blob> {
    const res = await fetch(base64);
    return await res.blob();
  }

  /**
   * 导出选中的项目
   */
  static async exportProjects(projectIds: number[]): Promise<void> {
    const exportData: ExportData = {
      version: '1.0',
      timestamp: Date.now(),
      projects: []
    };

    for (const projectId of projectIds) {
      const project = await db.projects.get(projectId);
      if (!project) continue;

      const paragraphs = await db.paragraphs.where('projectId').equals(projectId).sortBy('order');
      const paragraphData = [];

      for (const para of paragraphs) {
        const vocab = await db.vocabulary.where('paragraphId').equals(para.id!).toArray();
        let imageBase64: string | undefined;
        
        if (para.imageData) {
          imageBase64 = await this.blobToBase64(para.imageData);
        }

        paragraphData.push({
          ...para,
          vocabulary: vocab,
          imageBase64
        });
      }

      let coverImageBase64: string | undefined;
      if (project.coverImageData) {
        coverImageBase64 = await this.blobToBase64(project.coverImageData);
      }

      exportData.projects.push({
        project,
        paragraphs: paragraphData,
        coverImageBase64
      });
    }

    const json = JSON.stringify(exportData);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `EnglishReading_Export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * 解析导入文件，返回包含的项目列表供用户选择
   */
  static async parseImportFile(file: File): Promise<ExportData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string) as ExportData;
          resolve(data);
        } catch (err) {
          reject(new Error('无效的导入文件'));
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  /**
   * 导入选中的项目
   * 重构：先转换所有二进制数据，再开启数据库事务，确保事务内只有 DB 操作
   */
  static async importProjects(
    data: ExportData, 
    selectedProjectTitles: string[], 
    strategy: 'overwrite' | 'copy' = 'copy'
  ): Promise<void> {
    // 1. 预处理：在事务开始前转换所有 Base64 到 Blob
    const preparedProjects = [];
    for (const item of data.projects) {
      if (!selectedProjectTitles.includes(item.project.title)) continue;

      let coverImageData: Blob | undefined;
      if (item.coverImageBase64) {
        coverImageData = await this.base64ToBlob(item.coverImageBase64);
      }

      const preparedParagraphs = [];
      for (const para of item.paragraphs) {
        let imageData: Blob | undefined;
        if (para.imageBase64) {
          imageData = await this.base64ToBlob(para.imageBase64);
        }
        preparedParagraphs.push({ ...para, imageData });
      }

      preparedProjects.push({
        ...item,
        coverImageData,
        preparedParagraphs
      });
    }

    // 2. 开启事务：此时事务内全是同步的 DB 操作或基于 Dexie 的异步操作
    await db.transaction('rw', [db.projects, db.paragraphs, db.vocabulary], async () => {
      for (const item of preparedProjects) {
        const { project, preparedParagraphs, coverImageData } = item;
        
        // 如果是覆盖策略，先删除同名项目
        if (strategy === 'overwrite') {
          const existing = await db.projects.where('title').equals(project.title).first();
          if (existing?.id) {
            const paras = await db.paragraphs.where('projectId').equals(existing.id).toArray();
            const paraIds = paras.map(p => p.id!);
            if (paraIds.length > 0) {
              await db.vocabulary.where('paragraphId').anyOf(paraIds).delete();
            }
            await db.paragraphs.where('projectId').equals(existing.id).delete();
            await db.projects.delete(existing.id);
          }
        }

        // 写入项目
        const newProject: Project = {
          title: strategy === 'copy' ? `${project.title} (Copy)` : project.title,
          isSample: false,
          createdAt: Date.now(),
          coverImage: project.coverImage,
          coverImageData: coverImageData
        };

        const newProjectId = await db.projects.add(newProject);

        // 写入段落
        for (const paraItem of preparedParagraphs) {
          const { vocabulary, imageBase64, id, paragraphId, ...paraData } = paraItem;
          
          const newPara: Paragraph = {
            ...paraData,
            projectId: newProjectId as number,
          };

          const newParaId = await db.paragraphs.add(newPara);

          // 写入词汇
          for (const vocab of vocabulary) {
            const { id: vId, paragraphId: vParaId, ...vocabData } = vocab;
            await db.vocabulary.add({
              ...vocabData,
              paragraphId: newParaId as number
            } as Vocabulary);
          }
        }
      }
    });
  }
}
