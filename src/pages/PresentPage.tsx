import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ReaderEngine } from '../components/reader/ReaderEngine';
import { WordCard } from '../components/reader/WordCard';
import { ChevronLeft, ChevronRight, Book } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import { Vocabulary } from '../api/db';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PresentPage: React.FC = () => {
  const location = useLocation();
  const {
    currentProject,
    paragraphs,
    loadProject,
    getVocabForParagraph,
    excludeWord,
    readerFont,
    setReaderFont
  } = useProjectStore();

  const [activeWord, setActiveWord] = useState<(Vocabulary & { isGlobal?: boolean }) | null>(null);
  const [currentParaVocab, setCurrentParaVocab] = useState<(Vocabulary & { isGlobal?: boolean })[]>([]);
  const [pageIndex, setPageIndex] = useState(0);

  // 从路由 state 中获取初始参数（如果有的话）
  useEffect(() => {
    if (location.state?.paraIndex !== undefined) {
      setPageIndex(location.state.paraIndex);
    }
  }, [location.state]);

  // 当处于展示模式或切换页面时，加载当前段落的词汇
  useEffect(() => {
    if (paragraphs[pageIndex]) {
      getVocabForParagraph(paragraphs[pageIndex].id!, true).then(setCurrentParaVocab);
    }
  }, [pageIndex, paragraphs, getVocabForParagraph]);

  // 如果有 vocabId，自动展示该词汇卡片
  useEffect(() => {
    if (location.state?.vocabId && currentParaVocab.length > 0) {
      const targetVocab = currentParaVocab.find(v => v.id === location.state.vocabId);
      if (targetVocab) {
        setActiveWord(targetVocab);
      }
    }
  }, [location.state?.vocabId, currentParaVocab]);

  const handleWordClick = (word: string) => {
    const entry = currentParaVocab.find(v => v.word.toLowerCase() === word.toLowerCase());
    if (entry) {
      setActiveWord(entry);
    }
  };

  const currentParagraph = paragraphs[pageIndex];

  if (!currentProject || !currentParagraph) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center text-luxury-muted">
        <p className="text-xl font-serif italic">请先选择一个课程</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] overflow-hidden relative">
      <ReaderEngine
        content={currentParagraph.content}
        imageUrl={currentParagraph.image}
        imageData={currentParagraph.imageData}
        highlightedWords={currentParaVocab}
        onWordClick={handleWordClick}
        fontClass={
          readerFont === 'serif-classic' ? 'font-serif-classic' :
          readerFont === 'serif-modern' ? 'font-serif-modern' :
          readerFont === 'sans-modern' ? 'font-sans-modern' : 'font-sans-elegant'
        }
      />

      <WordCard
        word={activeWord}
        templateId={currentProject?.templateId}
        onClose={() => setActiveWord(null)}
        onExclude={async (word) => {
          if (currentParagraph?.id) {
            await excludeWord(currentParagraph.id, word);
            const updated = await getVocabForParagraph(currentParagraph.id, true);
            setCurrentParaVocab(updated);
            setActiveWord(null);
          }
        }}
      />

      {/* 字体选择与单词本快速入口 - 位于左下角 */}
      <div className="fixed bottom-[144px] left-16 z-40 space-y-4 w-72">
        {/* 字体选择器 */}
        <div className="flex flex-col gap-3 bg-luxury-bg/90 backdrop-blur-md border border-luxury-text/20 p-3 shadow-sm w-full">
          <span className="text-xxs2 uppercase tracking-[0.2em] text-luxury-gold font-bold mb-1">Typography</span>
          <div className="flex gap-2">
            {[
              { id: 'serif-classic', label: 'Classic', title: 'Georgia / 宋体' },
              { id: 'serif-modern', label: 'Book', title: 'Times New Roman / 宋体' },
              { id: 'sans-modern', label: 'Clean', title: 'Inter / 微软雅黑' },
              { id: 'sans-elegant', label: 'System', title: 'System Font / 苹方/微软雅黑' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setReaderFont(f.id as any);
                }}
                title={f.title}
                className={cn(
                  "flex-1 h-10 flex items-center justify-center text-xs uppercase tracking-wider border transition-all duration-500",
                  readerFont === f.id
                    ? "bg-luxury-text text-luxury-bg border-luxury-text shadow-lg font-semibold"
                    : "bg-transparent text-luxury-text/40 border-luxury-text/10 hover:border-luxury-gold hover:text-luxury-text"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 底部导航 - 悬浮控制 */}
      {paragraphs.length > 1 && (
        <div className="fixed bottom-12 left-16 flex items-center justify-between bg-luxury-bg/90 backdrop-blur-md border border-luxury-text/20 px-6 py-3 z-40 w-72">
          <button
            disabled={pageIndex === 0}
            onClick={() => { setPageIndex(prev => prev - 1); setActiveWord(null); }}
            className="text-luxury-text/40 hover:text-luxury-text disabled:opacity-10 transition-colors"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-xxs2 uppercase tracking-[0.3em] text-luxury-gold font-bold">Plateau</span>
            <span className="font-serif italic text-sm leading-none">
              {String(pageIndex + 1).padStart(2, '0')} / {String(paragraphs.length).padStart(2, '0')}
            </span>
          </div>
          <button
            disabled={pageIndex === paragraphs.length - 1}
            onClick={() => { setPageIndex(prev => prev + 1); setActiveWord(null); }}
            className="text-luxury-text/40 hover:text-luxury-text disabled:opacity-10 transition-colors"
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
};
