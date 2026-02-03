import { create } from 'zustand';
import { db, Project, Paragraph, Vocabulary } from '../api/db';
import { SAMPLE_PROJECT, SAMPLE_BOOK_NOTES } from '../api/seedData';
import { projectService, vocabularyService } from '../services';

interface ProjectState {
  currentProject: Project | null;
  paragraphs: Paragraph[];
  readerFont: 'serif-classic' | 'serif-modern' | 'sans-modern' | 'sans-elegant';
  
  setCurrentProject: (project: Project | null) => void;
  setReaderFont: (font: 'serif-classic' | 'serif-modern' | 'sans-modern' | 'sans-elegant') => void;
  loadProject: (id: number) => Promise<void>;
  saveProject: (title: string, id?: number, extra?: Partial<Project>) => Promise<number>;
  
  fetchParagraphs: (projectId: number) => Promise<void>;
  addParagraph: (projectId: number, order: number) => Promise<number>;
  updateParagraph: (id: number, data: Partial<Paragraph>) => Promise<void>;
  deleteParagraph: (id: number) => Promise<void>;

  getVocabForParagraph: (paragraphId: number, includeGlobal?: boolean) => Promise<(Vocabulary & { isGlobal?: boolean })[]>;
  saveVocab: (vocab: Omit<Vocabulary, 'id'> & { id?: number }) => Promise<void>;
  deleteVocab: (id: number) => Promise<void>;
  
  excludeWord: (paragraphId: number, word: string) => Promise<void>;
  includeWord: (paragraphId: number, word: string) => Promise<void>;

  initializeSampleData: () => Promise<boolean>;
  resetSampleData: () => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  paragraphs: [],
  readerFont: 'serif-classic',

  setCurrentProject: (project) => set({ currentProject: project }),
  setReaderFont: (font) => set({ readerFont: font }),

  loadProject: async (id) => {
    const project = await projectService.getProject(id);
    if (project) {
      set({ currentProject: project });
      const paragraphs = await projectService.getParagraphs(id);
      set({ paragraphs });
    }
  },

  saveProject: async (title, id, extra = {}) => {
    let actualId: number;
    if (id) {
      await projectService.updateProject(id, title);
      if (Object.keys(extra).length > 0) {
        await db.projects.update(id, extra);
      }
      actualId = id;
    } else {
      actualId = await projectService.createProject(title);
      if (Object.keys(extra).length > 0) {
        await db.projects.update(actualId, extra);
      }
    }

    const updated = await projectService.getProject(actualId);
    set({ currentProject: updated || null });
    return actualId;
  },

  fetchParagraphs: async (projectId) => {
    const data = await projectService.getParagraphs(projectId);
    set({ paragraphs: data });
  },

  addParagraph: async (projectId, order) => {
    const id = await projectService.addParagraph(projectId, order);
    await get().fetchParagraphs(projectId);
    return id;
  },

  updateParagraph: async (id, data) => {
    await projectService.updateParagraph(id, data);
    if (get().currentProject?.id) {
      await get().fetchParagraphs(get().currentProject!.id!);
    }
  },

  deleteParagraph: async (id) => {
    await projectService.deleteParagraph(id);
    if (get().currentProject?.id) {
      await get().fetchParagraphs(get().currentProject!.id!);
    }
  },

  getVocabForParagraph: async (paragraphId, includeGlobal = false) => {
    if (includeGlobal) {
      return await vocabularyService.getSmartVocabulary(paragraphId);
    }
    return await vocabularyService.getVocabularyByParagraph(paragraphId);
  },

  saveVocab: async (vocab) => {
    await vocabularyService.saveVocabulary(vocab);
  },

  deleteVocab: async (id) => {
    await vocabularyService.deleteVocabulary(id);
  },

  excludeWord: async (paragraphId, word) => {
    await vocabularyService.excludeWordFromParagraph(paragraphId, word);
    if (get().currentProject?.id) {
      await get().fetchParagraphs(get().currentProject!.id!);
    }
  },

  includeWord: async (paragraphId, word) => {
    await vocabularyService.includeWordInParagraph(paragraphId, word);
    if (get().currentProject?.id) {
      await get().fetchParagraphs(get().currentProject!.id!);
    }
  },

  initializeSampleData: async () => {
    return await db.transaction('rw', [db.projects, db.paragraphs, db.vocabulary], async () => {
      const samples = [
        { data: SAMPLE_PROJECT, name: '英语精读示例', templateId: 'english-reading' },
        { data: SAMPLE_BOOK_NOTES, name: '读书笔记示例', templateId: 'knowledge-notes' }
      ];

      let createdNew = false;

      // 获取所有现有的示例项目
      const existingSamples = await db.projects
        .where('isSample')
        .equals(true)
        .toArray();

      for (const sample of samples) {
        // 检查是否已存在该示例（通过 title）
        const exists = existingSamples.some(p => p.title === sample.data.project.title);

        if (exists) {
          // 已存在，跳过
          continue;
        }

        // 不存在，创建示例项目
        const projectId = await db.projects.add({
          ...sample.data.project,
          isSample: true,
          templateId: sample.templateId
        } as Project);

        for (const para of sample.data.paragraphs) {
          const { vocabulary, ...paraData } = para;
          const paragraphId = await db.paragraphs.add({
            ...paraData,
            projectId: projectId as number,
          } as Paragraph);

          for (const vocab of vocabulary) {
            await db.vocabulary.add({
              ...vocab,
              paragraphId: paragraphId as number
            } as Vocabulary);
          }
        }

        createdNew = true;
      }

      return createdNew;
    });
  },

  resetSampleData: async () => {
    try {
      await db.transaction('rw', [db.projects, db.paragraphs, db.vocabulary], async () => {
        // 1. 删除所有标记为 isSample 的项目及其关联数据
        const sampleProjects = await db.projects.where('isSample').equals(true).toArray();

        for (const project of sampleProjects) {
          const projectId = project.id!;

          // 删除项目的所有段落
          const paragraphs = await db.paragraphs.where('projectId').equals(projectId).toArray();

          // 删除每个段落的词汇
          for (const para of paragraphs) {
            await db.vocabulary.where('paragraphId').equals(para.id!).delete();
          }

          // 删除段落
          await db.paragraphs.where('projectId').equals(projectId).delete();

          // 删除项目
          await db.projects.delete(projectId);
        }

        // 2. 重新创建所有示例项目
        const samples = [
          { data: SAMPLE_PROJECT, templateId: 'english-reading' },
          { data: SAMPLE_BOOK_NOTES, templateId: 'knowledge-notes' }
        ];

        for (const sample of samples) {
          const projectId = await db.projects.add({
            ...sample.data.project,
            isSample: true,
            templateId: sample.templateId
          } as Project);

          for (const para of sample.data.paragraphs) {
            const { vocabulary, ...paraData } = para;
            const paragraphId = await db.paragraphs.add({
              ...paraData,
              projectId: projectId as number,
            } as Paragraph);

            for (const vocab of vocabulary) {
              await db.vocabulary.add({
                ...vocab,
                paragraphId: paragraphId as number
              } as Vocabulary);
            }
          }
        }
      });

      // 清空当前项目状态
      set({ currentProject: null, paragraphs: [] });
    } catch (error) {
      console.error('重置示例数据失败:', error);
      throw error;
    }
  }
}));
