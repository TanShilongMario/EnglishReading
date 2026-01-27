import { create } from 'zustand';
import { db, Project, Paragraph, Vocabulary } from '../api/db';
import { SAMPLE_PROJECT } from '../api/seedData';
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
      // 1. 首先检查是否有显式标记为 isSample 的项目
      const existingByFlag = await db.projects.where('isSample').equals(1).first();
      
      if (existingByFlag) {
        // 加固：如果已存在示例项目但缺少封面，则自动补全
        if (!existingByFlag.coverImage && SAMPLE_PROJECT.project.coverImage) {
          await db.projects.update(existingByFlag.id!, { 
            coverImage: SAMPLE_PROJECT.project.coverImage 
          });
          return true; // 返回 true 以触发 UI 刷新
        }
        return false;
      }

      // 2. 如果没有标记，再检查是否有原始标题的项目（兼容旧版本）
      const existingByTitle = await db.projects.where('title').equals(SAMPLE_PROJECT.project.title).first();
      
      if (existingByTitle) {
        // 如果找到了原始标题的项目，给它补上 isSample 标记和封面
        await db.projects.update(existingByTitle.id!, { 
          isSample: true,
          coverImage: SAMPLE_PROJECT.project.coverImage 
        });
        return true;
      }

      // 3. 确实不存在，则创建
      const projectId = await db.projects.add({
        ...SAMPLE_PROJECT.project,
        isSample: true
      } as Project);

      for (const para of SAMPLE_PROJECT.paragraphs) {
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
      return true;
    });
  }
}));
