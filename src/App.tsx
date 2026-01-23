import React, { useState, useEffect } from 'react';
import { ReaderEngine } from './components/reader/ReaderEngine';
import { WordCard } from './components/reader/WordCard';
import { EditorMode } from './components/editor/EditorMode';
import { VocabularyBook } from './components/vocabulary/VocabularyBook';
import { InstructionsModal } from './components/common/InstructionsModal';
import { ChevronLeft, ChevronRight, BookOpen, Layout, Plus, Trash2, Home, Presentation, Book, HelpCircle } from 'lucide-react';
import { useProjectStore } from './store/useProjectStore';
import { db, Vocabulary } from './api/db';

function App() {
  const { 
    currentProject, 
    paragraphs, 
    setCurrentProject, 
    loadProject, 
    fetchParagraphs,
    getVocabForParagraph,
    saveProject,
    initializeSampleData
  } = useProjectStore();

  const [activeWord, setActiveWord] = useState<Vocabulary | null>(null);
  const [currentParaVocab, setCurrentParaVocab] = useState<Vocabulary[]>([]);
  const [mode, setMode] = useState<'manage' | 'edit' | 'present' | 'vocab'>('manage');
  const [pageIndex, setPageIndex] = useState(0);
  const [projects, setProjects] = useState<any[]>([]);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  // 初始化示例数据
  useEffect(() => {
    initializeSampleData().then(added => {
      if (added) {
        // 如果新添加了示例数据，刷新项目列表
        db.projects.toArray().then(setProjects);
      }
    });
  }, [initializeSampleData]);

  // 加载项目列表
  useEffect(() => {
    const fetchAll = async () => {
      const all = await db.projects.toArray();
      setProjects(all);
    };
    fetchAll();
  }, [currentProject]);

  // 当处于展示模式或切换页面时，加载当前段落的词汇
  useEffect(() => {
    if (mode === 'present' && paragraphs[pageIndex]) {
      getVocabForParagraph(paragraphs[pageIndex].id!).then(setCurrentParaVocab);
    }
  }, [mode, pageIndex, paragraphs, getVocabForParagraph]);

  const handleWordClick = (word: string) => {
    const entry = currentParaVocab.find(v => v.word.toLowerCase() === word.toLowerCase());
    if (entry) {
      setActiveWord(entry);
    }
  };

  const handleCreateNew = async () => {
    const id = await saveProject('新建精读课程');
    await loadProject(id);
    setPageIndex(0);
    setMode('edit');
  };

  const handleDeleteProject = async (id: number) => {
    if (confirm('确定要删除这篇文章吗？')) {
      await db.projects.delete(id);
      const paras = await db.paragraphs.where('projectId').equals(id).toArray();
      for (const p of paras) {
        await db.vocabulary.where('paragraphId').equals(p.id!).delete();
      }
      await db.paragraphs.where('projectId').equals(id).delete();
      setProjects(prev => prev.filter(p => p.id !== id));
      if (currentProject?.id === id) setCurrentProject(null);
    }
  };

  const currentParagraph = paragraphs[pageIndex];

  return (
    <div className="min-h-screen bg-luxury-bg font-sans text-luxury-text selection:bg-luxury-gold/30 overflow-hidden relative">
      {/* 装饰性元素 */}
      <div className="paper-texture" />
      <div className="grid-lines">
        <div className="grid-line" />
        <div className="grid-line" />
        <div className="grid-line" />
        <div className="grid-line" />
      </div>

      {/* 顶部导航 - 极致社刊感 */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-luxury-bg/80 backdrop-blur-md border-b border-luxury-text/10 flex items-center justify-between px-16 z-[60]">
        <div 
          className="flex items-center gap-4 cursor-pointer group"
          onClick={() => setMode('manage')}
        >
          <span className="font-serif italic text-2xl tracking-tighter">CORNER BOOK.</span>
          <div className="h-4 w-px bg-luxury-text/20" />
          <span className="text-[10px] uppercase tracking-editorial font-bold text-luxury-muted">English Reading / Vol.01</span>
        </div>
        
        <div className="flex gap-4 font-serif">
          <button 
            onClick={() => setMode('manage')}
            className={`px-6 py-2 text-sm uppercase tracking-button font-bold transition-all duration-500 hover:bg-luxury-text/5 ${mode === 'manage' ? 'text-luxury-gold' : 'text-luxury-text/60 hover:text-luxury-text'}`}
          >
            课程库
          </button>
          <button 
            onClick={() => setMode('vocab')}
            className={`px-6 py-2 text-sm uppercase tracking-button font-bold transition-all duration-500 hover:bg-luxury-text/5 ${mode === 'vocab' ? 'text-luxury-gold' : 'text-luxury-text/60 hover:text-luxury-text'}`}
          >
            单词本
          </button>
          <button 
            disabled={!currentProject}
            onClick={() => setMode('present')}
            className={`px-6 py-2 text-sm uppercase tracking-button font-bold transition-all duration-500 hover:bg-luxury-text/5 ${!currentProject ? 'opacity-20' : mode === 'present' ? 'text-luxury-gold' : 'text-luxury-text/60 hover:text-luxury-text'}`}
          >
            展示模式
          </button>
          <button 
            disabled={!currentProject}
            onClick={() => setMode('edit')}
            className={`px-6 py-2 text-sm uppercase tracking-button font-bold transition-all duration-500 hover:bg-luxury-text/5 ${!currentProject ? 'opacity-20' : mode === 'edit' ? 'text-luxury-gold' : 'text-luxury-text/60 hover:text-luxury-text'}`}
          >
            内容编辑
          </button>
          <div className="w-px h-4 bg-luxury-text/10 self-center mx-2" />
          <button 
            onClick={() => setIsInstructionsOpen(true)}
            className="p-2 text-luxury-muted hover:text-luxury-gold hover:bg-luxury-text/5 transition-all duration-500 rounded-full"
            title="使用说明"
          >
            <HelpCircle size={18} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="pt-20 min-h-screen relative z-10">
        {mode === 'manage' && (
          <div className="max-w-[1600px] mx-auto p-16 space-y-24">
            <header className="flex flex-col gap-4">
              <span className="text-xs uppercase tracking-[0.3em] text-luxury-gold font-bold">The Collection</span>
              <h2 className="text-8xl font-serif font-normal leading-[0.9] tracking-tighter">Your Reading <br/><span className="italic">Inventory</span></h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-12">
              <button 
                onClick={handleCreateNew}
                className="h-64 border border-luxury-text/30 flex flex-col items-center justify-center gap-6 hover:bg-luxury-text hover:text-luxury-bg transition-all duration-700 group relative"
              >
                <Plus size={48} strokeWidth={1} />
                <span className="text-xs uppercase tracking-button font-bold">New Entry</span>
              </button>

              {projects.map(project => (
                <div key={project.id} className="h-64 flex flex-col group relative">
                  <div className="flex-1 border border-luxury-text/30 p-8 flex flex-col justify-between hover:border-luxury-gold transition-colors duration-700">
                    <div className="space-y-4">
                      <span className="text-[10px] uppercase tracking-widest text-luxury-muted">
                        {new Date(project.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      <h3 className="text-2xl font-serif leading-tight line-clamp-2">{project.title}</h3>
                    </div>

                    <div className="space-y-4">
                      <button 
                        onClick={async () => { await loadProject(project.id!); setPageIndex(0); setMode('present'); }}
                        className="w-full border border-luxury-text py-3 text-[10px] uppercase tracking-button font-bold hover:bg-luxury-text hover:text-luxury-bg transition-all duration-500"
                      >
                        Enter Exhibition
                      </button>
                      <div className="flex justify-between items-center px-1">
                        <button 
                          onClick={async () => { await loadProject(project.id!); setPageIndex(0); setMode('edit'); }}
                          className="text-[10px] uppercase tracking-widest font-bold hover:text-luxury-gold transition-colors"
                        >
                          Curate
                        </button>
                        <button 
                          onClick={() => handleDeleteProject(project.id!)}
                          className="text-[10px] uppercase tracking-widest font-bold hover:text-red-800 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          Dispose
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === 'present' && currentProject && currentParagraph && (
          <div className="h-[calc(100vh-80px)] overflow-hidden relative">
            <ReaderEngine 
              content={currentParagraph.content}
              imageUrl={currentParagraph.image}
              imageData={currentParagraph.imageData}
              highlightedWords={currentParaVocab}
              onWordClick={handleWordClick}
            />
            
            <WordCard 
              word={activeWord} 
              onClose={() => setActiveWord(null)} 
            />

            {/* 单词本快速入口 - 位于段落切换上方 */}
            <div className="fixed bottom-32 left-16 z-40">
              <button 
                onClick={() => setMode('vocab')}
                className="flex items-center gap-3 bg-luxury-bg/90 backdrop-blur-md border border-luxury-text/20 px-6 py-3 hover:border-luxury-gold transition-all group shadow-sm"
              >
                <Book size={18} className="text-luxury-gold" />
                <span className="text-[10px] uppercase tracking-button font-bold text-luxury-muted group-hover:text-luxury-text">单词本</span>
              </button>
            </div>
            
            {/* 底部导航 - 悬浮控制 */}
            {paragraphs.length > 1 && (
              <div className="fixed bottom-12 left-16 flex items-center gap-12 bg-luxury-bg/90 backdrop-blur-md border border-luxury-text/20 px-8 py-4 z-40">
                <button 
                  disabled={pageIndex === 0}
                  onClick={() => { setPageIndex(prev => prev - 1); setActiveWord(null); }}
                  className="text-luxury-text/40 hover:text-luxury-text disabled:opacity-10 transition-colors"
                >
                  <ChevronLeft size={24} strokeWidth={1} />
                </button>
                <div className="flex flex-col items-start min-w-[100px]">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-luxury-gold font-bold">Plateau</span>
                  <span className="font-serif italic text-lg leading-none">
                    {String(pageIndex + 1).padStart(2, '0')} / {String(paragraphs.length).padStart(2, '0')}
                  </span>
                </div>
                <button 
                  disabled={pageIndex === paragraphs.length - 1}
                  onClick={() => { setPageIndex(prev => prev + 1); setActiveWord(null); }}
                  className="text-luxury-text/40 hover:text-luxury-text disabled:opacity-10 transition-colors"
                >
                  <ChevronRight size={24} strokeWidth={1} />
                </button>
              </div>
            )}
          </div>
        )}

        {mode === 'edit' && <EditorMode />}

        {mode === 'vocab' && (
          <VocabularyBook 
            onNavigateToArticle={async (projectId, paraId) => {
              await loadProject(projectId);
              // 直接从数据库查询最新的段落列表以获取正确的索引
              const paras = await db.paragraphs.where('projectId').equals(projectId).sortBy('order');
              const paraIndex = paras.findIndex(p => p.id === paraId);
              setPageIndex(paraIndex >= 0 ? paraIndex : 0);
              setMode('present');
            }}
          />
        )}
      </main>

      <InstructionsModal 
        isOpen={isInstructionsOpen} 
        onClose={() => setIsInstructionsOpen(false)} 
      />
    </div>
  );
}

export default App;
