import React from 'react';
import { useLocation } from 'react-router-dom';
import { EditorMode } from '../components/editor/EditorMode';
import { useProjectStore } from '../store/useProjectStore';

export const EditPage: React.FC = () => {
  const { currentProject } = useProjectStore();
  const location = useLocation();
  const state = location.state as { activeParagraphId?: number; editVocabId?: number } | null;

  if (!currentProject) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center text-luxury-muted">
        <p className="text-xl font-serif italic">请先选择一个课程</p>
      </div>
    );
  }

  return (
    <EditorMode
      initialParagraphId={state?.activeParagraphId}
      initialEditVocabId={state?.editVocabId}
    />
  );
};
