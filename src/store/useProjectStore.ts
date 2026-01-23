import { create } from 'zustand';
import { db, Project, Paragraph, Vocabulary } from '../api/db';
import { SAMPLE_PROJECT } from '../api/seedData';

interface ProjectState {
  currentProject: Project | null;
  paragraphs: Paragraph[];
  
  setCurrentProject: (project: Project | null) => void;
  loadProject: (id: number) => Promise<void>;
  saveProject: (title: string, id?: number) => Promise<number>;
  
  fetchParagraphs: (projectId: number) => Promise<void>;
  addParagraph: (projectId: number, order: number) => Promise<number>;
  updateParagraph: (id: number, data: Partial<Paragraph>) => Promise<void>;
  deleteParagraph: (id: number) => Promise<void>;

  getVocabForParagraph: (paragraphId: number) => Promise<Vocabulary[]>;
  saveVocab: (vocab: Omit<Vocabulary, 'id'> & { id?: number }) => Promise<void>;
  deleteVocab: (id: number) => Promise<void>;

  initializeSampleData: () => Promise<boolean>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  paragraphs: [],

  setCurrentProject: (project) => set({ currentProject: project }),

  loadProject: async (id) => {
    const project = await db.projects.get(id);
    if (project) {
      set({ currentProject: project });
      await get().fetchParagraphs(id);
    }
  },

  saveProject: async (title, id) => {
    const projectId = await db.projects.put({
      id,
      title,
      createdAt: Date.now()
    } as Project);
    const updated = await db.projects.get(projectId);
    set({ currentProject: updated || null });
    return projectId as number;
  },

  fetchParagraphs: async (projectId) => {
    const data = await db.paragraphs
      .where('projectId')
      .equals(projectId)
      .sortBy('order');
    set({ paragraphs: data });
  },

  addParagraph: async (projectId, order) => {
    const id = await db.paragraphs.add({
      projectId,
      content: '',
      order,
    } as Paragraph);
    await get().fetchParagraphs(projectId);
    return id as number;
  },

  updateParagraph: async (id, data) => {
    await db.paragraphs.update(id, data);
    if (get().currentProject?.id) {
      await get().fetchParagraphs(get().currentProject!.id!);
    }
  },

  deleteParagraph: async (id) => {
    await db.paragraphs.delete(id);
    await db.vocabulary.where('paragraphId').equals(id).delete();
    if (get().currentProject?.id) {
      await get().fetchParagraphs(get().currentProject!.id!);
    }
  },

  getVocabForParagraph: async (paragraphId) => {
    return await db.vocabulary.where('paragraphId').equals(paragraphId).toArray();
  },

  saveVocab: async (vocab) => {
    await db.vocabulary.put(vocab as Vocabulary);
  },

  deleteVocab: async (id) => {
    await db.vocabulary.delete(id);
  },

  initializeSampleData: async () => {
    const existing = await db.projects.where('title').equals(SAMPLE_PROJECT.project.title).first();
    if (!existing) {
      const projectId = await db.projects.add(SAMPLE_PROJECT.project as Project);
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
      // 添加完成后，返回 true 以便外部刷新
      return true;
    }
    return false;
  }
}));
