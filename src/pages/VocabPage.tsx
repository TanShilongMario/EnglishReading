import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VocabularyBook } from '../components/vocabulary/VocabularyBook';
import { useProjectStore } from '../store/useProjectStore';
import { projectService, vocabularyService } from '../services';
import { Vocabulary } from '../api/db';

export const VocabPage: React.FC = () => {
  const navigate = useNavigate();
  const { loadProject } = useProjectStore();
  const { index, vocab } = useParams();

  // 如果从 URL 参数中传入了 index 和 vocab，自动导航到对应段落和词汇
  useEffect(() => {
    if (index !== undefined) {
      // 这里可以处理自动跳转逻辑，暂时留空
      // 实际的跳转逻辑在 VocabularyBook 组件中处理
    }
  }, [index, vocab]);

  const handleNavigateToArticle = async (projectId: number, paraId: number, vocabId?: number) => {
    await loadProject(projectId);
    const paras = await projectService.getParagraphs(projectId);
    const paraIndex = paras.findIndex(p => p.id === paraId);

    // 导航到展示模式并传递参数
    navigate(`/present`, { state: { paraIndex: paraIndex >= 0 ? paraIndex : 0, vocabId } });
  };

  const handleNavigateToEdit = async (projectId: number, paraId: number, vocabId: number) => {
    await loadProject(projectId);
    // 导航到编辑模式并传递参数
    navigate(`/edit`, { state: { activeParagraphId: paraId, editVocabId: vocabId } });
  };

  return <VocabularyBook onNavigateToArticle={handleNavigateToArticle} onNavigateToEdit={handleNavigateToEdit} />;
};
