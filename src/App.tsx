import React, { useState, useEffect } from 'react';
import { ReaderEngine } from './components/reader/ReaderEngine';
import { WordCard } from './components/reader/WordCard';
import { EditorMode } from './components/editor/EditorMode';
import { VocabularyBook } from './components/vocabulary/VocabularyBook';
import { InstructionsModal } from './components/common/InstructionsModal';
import { ChevronLeft, ChevronRight, BookOpen, Layout, Plus, Trash2, Home, Presentation, Book, HelpCircle, Download, Upload, CheckSquare, Square, CheckCircle2, AlertCircle } from 'lucide-react';
import { useProjectStore } from './store/useProjectStore';
import { db, Vocabulary, migrateDatabase, Project } from './api/db';
import { projectService, vocabularyService } from './services';
import { ImportExportService, ExportData } from './services/ImportExportService';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ----------------------------------------------------------------------------
// Toast 通知组件
// ----------------------------------------------------------------------------
const Toast: React.FC<{ message: string; type?: 'success' | 'error'; onClose: () => void }> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-8 py-4 bg-luxury-text text-luxury-bg shadow-2xl border border-white/10"
    >
      {type === 'success' ? <CheckCircle2 size={18} className="text-luxury-gold" /> : <AlertCircle size={18} className="text-red-500" />}
      <span className="text-[10px] uppercase tracking-widest font-bold">{message}</span>
    </motion.div>
  );
};

// ----------------------------------------------------------------------------
// 冲突选择弹窗
// ----------------------------------------------------------------------------
interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: string[];
  onResolve: (strategy: 'overwrite' | 'copy') => void;
}

const ConflictModal: React.FC<ConflictModalProps> = ({ isOpen, onClose, conflicts, onResolve }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-luxury-bg/80 backdrop-blur-md p-8">
      <div className="bg-white border border-luxury-text/10 shadow-2xl w-full max-w-lg p-12 space-y-8">
        <header className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-red-800 font-bold block">Conflict Detected</span>
          <h2 className="text-3xl font-serif tracking-tight">文章名称已存在</h2>
          <p className="text-sm text-luxury-muted">以下文章在您的库中已存在相同标题：</p>
          <ul className="text-sm font-bold text-luxury-text list-disc list-inside">
            {conflicts.map(c => <li key={c}>{c}</li>)}
          </ul>
        </header>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => onResolve('overwrite')}
            className="w-full py-5 border border-luxury-text hover:bg-luxury-text hover:text-luxury-bg transition-all uppercase text-[10px] tracking-widest font-bold"
          >
            覆盖现有内容
          </button>
          <button 
            onClick={() => onResolve('copy')}
            className="w-full py-5 bg-luxury-text text-luxury-bg hover:bg-luxury-gold transition-all uppercase text-[10px] tracking-widest font-bold"
          >
            保留两者 (作为副本导入)
          </button>
        </div>
        
        <button onClick={onClose} className="w-full text-[10px] uppercase tracking-widest font-bold text-luxury-muted hover:text-luxury-text py-2">
          取消导入
        </button>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------
// 导入导出弹窗组件
// ----------------------------------------------------------------------------
interface SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: { id: string | number; label: string }[];
  onConfirm: (selectedIds: (string | number)[]) => void;
  confirmText: string;
}

const SelectionModal: React.FC<SelectionModalProps> = ({ isOpen, onClose, title, items, onConfirm, confirmText }) => {
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  useEffect(() => {
    if (isOpen) setSelectedIds(items.map(i => i.id)); // 默认全选
  }, [isOpen, items]);

  if (!isOpen) return null;

  const toggleAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(i => i.id));
    }
  };

  const toggleOne = (id: string | number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-luxury-bg/90 backdrop-blur-xl p-8">
      <div className="bg-white border border-luxury-text/10 shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh]">
        <header className="p-10 border-b border-luxury-text/5 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-luxury-gold font-bold mb-2 block">Database Action</span>
            <h2 className="text-4xl font-serif tracking-tight">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-luxury-muted hover:text-luxury-text transition-colors">
            <Plus size={24} className="rotate-45" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-4">
          <button 
            onClick={toggleAll}
            className="flex items-center gap-4 py-4 px-6 bg-luxury-text/5 hover:bg-luxury-text/10 transition-colors w-full group"
          >
            {selectedIds.length === items.length ? (
              <CheckSquare size={20} className="text-luxury-gold" />
            ) : (
              <Square size={20} className="text-luxury-muted" />
            )}
            <span className="text-xs uppercase tracking-widest font-bold">全选 / 取消全选</span>
          </button>

          <div className="grid gap-2">
            {items.map(item => (
              <button 
                key={item.id}
                onClick={() => toggleOne(item.id)}
                className="flex items-center gap-4 py-4 px-6 hover:bg-luxury-text/5 transition-colors text-left"
              >
                {selectedIds.includes(item.id) ? (
                  <CheckSquare size={18} className="text-luxury-gold" />
                ) : (
                  <Square size={18} className="text-luxury-muted/40" />
                )}
                <span className="font-serif text-lg">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <footer className="p-10 border-t border-luxury-text/5 flex justify-end gap-6">
          <button 
            onClick={onClose}
            className="px-8 py-4 text-xs uppercase tracking-button font-bold text-luxury-muted hover:text-luxury-text transition-colors"
          >
            取消
          </button>
          <button 
            disabled={selectedIds.length === 0}
            onClick={() => onConfirm(selectedIds)}
            className="px-10 py-4 bg-luxury-text text-luxury-bg text-xs uppercase tracking-button font-bold hover:bg-luxury-gold transition-all disabled:opacity-20"
          >
            {confirmText}
          </button>
        </footer>
      </div>
    </div>
  );
};

function App() {
  const [isMigrating, setIsMigrating] = useState(true);
  const { 
    currentProject, 
    paragraphs, 
    setCurrentProject, 
    loadProject, 
    fetchParagraphs,
    getVocabForParagraph,
    excludeWord,
    saveProject,
    readerFont,
    setReaderFont,
    initializeSampleData
  } = useProjectStore();

  const [activeWord, setActiveWord] = useState<(Vocabulary & { isGlobal?: boolean }) | null>(null);
  const [currentParaVocab, setCurrentParaVocab] = useState<(Vocabulary & { isGlobal?: boolean })[]>([]);
  const [mode, setMode] = useState<'manage' | 'edit' | 'present' | 'vocab'>('manage');
  const [pageIndex, setPageIndex] = useState(0);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectCoverUrls, setProjectCoverUrls] = useState<Record<number, string>>({});

  // 导入导出相关的状态
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importData, setImportData] = useState<ExportData | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [conflictData, setConflictData] = useState<{ titles: string[]; importData: ExportData; selectedTitles: string[] } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const processImport = async (data: ExportData, titles: string[], strategy?: 'overwrite' | 'copy') => {
    // 如果没有指定策略，先检查冲突
    if (!strategy) {
      const existingProjects = await db.projects.toArray();
      const existingTitles = existingProjects.map(p => p.title);
      const conflicts = titles.filter(t => existingTitles.includes(t));

      if (conflicts.length > 0) {
        setConflictData({ titles: conflicts, importData: data, selectedTitles: titles });
        return;
      }
    }

    try {
      await ImportExportService.importProjects(data, titles, strategy || 'copy');
      const all = await db.projects.toArray();
      setProjects(all);
      setIsImportModalOpen(false);
      setConflictData(null);
      showToast('文章导入成功');
    } catch (err) {
      console.error('Import Error:', err);
      showToast('导入过程中发生错误', 'error');
    }
  };

  // 处理项目封面 URL
  useEffect(() => {
    projects.forEach(project => {
      if (project.coverImageData && !projectCoverUrls[project.id]) {
        const url = URL.createObjectURL(project.coverImageData);
        setProjectCoverUrls(prev => ({ ...prev, [project.id]: url }));
      }
    });
  }, [projects]);

  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  // 数据库迁移（优先级最高）
  useEffect(() => {
    migrateDatabase().then(() => setIsMigrating(false));
  }, []);

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
      // 获取包含全局共享的词汇
      getVocabForParagraph(paragraphs[pageIndex].id!, true).then(setCurrentParaVocab);
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
      // 使用 Store 删除项目（内部会调用 Service）
      await projectService.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      if (currentProject?.id === id) setCurrentProject(null);
    }
  };

  const currentParagraph = paragraphs[pageIndex];

  // 显示迁移状态
  if (isMigrating) {
    return (
      <div className="min-h-screen bg-luxury-bg flex items-center justify-center font-serif">
        <div className="text-center space-y-6">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
          <p className="text-luxury-muted text-sm uppercase tracking-widest">数据库迁移中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-bg font-sans text-luxury-text selection:bg-luxury-gold/30 overflow-hidden relative">
      <div className="paper-texture" />
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
              <div className="flex justify-between items-end">
                <h2 className="text-8xl font-serif font-normal leading-[0.9] tracking-tighter">Your Reading <br/><span className="italic">Inventory</span></h2>
                <div className="flex gap-4 mb-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 px-6 py-4 bg-luxury-bg border border-luxury-text/10 hover:border-luxury-gold hover:bg-luxury-text/5 transition-all group"
                  >
                    <Download size={18} className="text-luxury-gold group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">导入文章</span>
                  </button>
                  <button 
                    onClick={() => setIsExportModalOpen(true)}
                    className="flex items-center gap-3 px-6 py-4 bg-luxury-bg border border-luxury-text/10 hover:border-luxury-gold hover:bg-luxury-text/5 transition-all group"
                  >
                    <Upload size={18} className="text-luxury-gold group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">导出文章</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".json"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const data = await ImportExportService.parseImportFile(file);
                          setImportData(data);
                          setIsImportModalOpen(true);
                        } catch (err) {
                          alert('导入失败：无效的文件格式');
                        }
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </header>

            {/* 弹窗组件 */}
            <SelectionModal 
              isOpen={isExportModalOpen}
              onClose={() => setIsExportModalOpen(false)}
              title="选择导出的文章"
              confirmText="开始导出"
              items={projects.map(p => ({ id: p.id, label: p.title }))}
              onConfirm={async (ids) => {
                await ImportExportService.exportProjects(ids as number[]);
                setIsExportModalOpen(false);
              }}
            />

            <SelectionModal 
              isOpen={isImportModalOpen}
              onClose={() => setIsImportModalOpen(false)}
              title="选择要导入的文章"
              confirmText="确认导入"
              items={importData?.projects.map(p => ({ id: p.project.title, label: p.project.title })) || []}
              onConfirm={async (titles) => {
                if (importData) {
                  await processImport(importData, titles as string[]);
                }
              }}
            />

            <ConflictModal 
              isOpen={!!conflictData}
              onClose={() => setConflictData(null)}
              conflicts={conflictData?.titles || []}
              onResolve={(strategy) => {
                if (conflictData) {
                  processImport(conflictData.importData, conflictData.selectedTitles, strategy);
                }
              }}
            />

            <AnimatePresence>
              {toast && (
                <Toast 
                  message={toast.message} 
                  type={toast.type} 
                  onClose={() => setToast(null)} 
                />
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16">
              <button 
                onClick={handleCreateNew}
                className="aspect-[3/4] border border-luxury-text/30 flex flex-col items-center justify-center gap-6 hover:bg-luxury-text hover:text-luxury-bg transition-all duration-700 group relative"
              >
                <Plus size={48} strokeWidth={1} />
                <span className="text-xs uppercase tracking-button font-bold">Create New Issue</span>
              </button>

              {projects.map(project => (
                <div 
                  key={project.id} 
                  className="flex flex-col group relative cursor-pointer"
                  onClick={async () => { await loadProject(project.id!); setPageIndex(0); setMode('present'); }}
                >
                  <div className="aspect-[3/4] border border-luxury-text/30 flex flex-col hover:border-luxury-gold transition-colors duration-700 overflow-hidden bg-white shadow-sm hover:shadow-xl transform hover:-translate-y-2 transition-transform duration-500">
                    {/* 封面图区域 */}
                    <div className="h-2/3 w-full bg-luxury-paper/20 relative overflow-hidden border-b border-luxury-text/10">
                      {project.coverImageData || project.coverImage ? (
                        <img 
                          src={project.coverImageData ? projectCoverUrls[project.id] : project.coverImage} 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-luxury-muted/20 italic font-serif">
                          No Visual
                        </div>
                      )}
                    </div>

                    {/* 标题区域 */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[8px] uppercase tracking-widest text-luxury-muted font-bold">
                          {new Date(project.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                        </span>
                        <h3 className="text-xl font-serif leading-tight line-clamp-2 group-hover:text-luxury-gold transition-colors">{project.title}</h3>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-luxury-text/5">
                        <div className="text-[10px] uppercase tracking-button font-bold text-luxury-text group-hover:text-luxury-gold transition-all">
                          Read Story
                        </div>
                        <div className="flex gap-2 -mr-2">
                          <button 
                            onClick={async (e) => { e.stopPropagation(); await loadProject(project.id!); setPageIndex(0); setMode('edit'); }}
                            className="p-2 text-[10px] uppercase tracking-widest font-bold text-luxury-muted hover:text-luxury-gold transition-colors flex items-center justify-center min-w-[44px]"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id!); }}
                            className="p-2 text-[10px] uppercase tracking-widest font-bold text-luxury-muted/40 hover:text-red-800 transition-colors flex items-center justify-center min-w-[44px]"
                          >
                            <Trash2 size={14} strokeWidth={1.5} />
                          </button>
                        </div>
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
              fontClass={
                readerFont === 'serif-classic' ? 'font-serif-classic' :
                readerFont === 'serif-modern' ? 'font-serif-modern' :
                readerFont === 'sans-modern' ? 'font-sans-modern' : 'font-sans-elegant'
              }
            />
            
            <WordCard 
              word={activeWord} 
              onClose={() => setActiveWord(null)} 
              onExclude={async (word) => {
                if (currentParagraph?.id) {
                  await excludeWord(currentParagraph.id, word);
                  // 刷新当前段落词汇
                  const updated = await getVocabForParagraph(currentParagraph.id, true);
                  setCurrentParaVocab(updated);
                  setActiveWord(null);
                }
              }}
            />

            {/* 字体选择与单词本快速入口 - 位于左下角 */}
            <div className="fixed bottom-[144px] left-16 z-40 space-y-4 w-80">
              {/* 字体选择器 */}
              <div className="flex flex-col gap-3 bg-luxury-bg/90 backdrop-blur-md border border-luxury-text/20 p-4 shadow-sm w-full">
                <span className="text-[8px] uppercase tracking-[0.2em] text-luxury-gold font-bold mb-1">Typography</span>
                <div className="flex gap-2">
                  {[
                    { id: 'serif-classic', label: 'Classic', title: 'Playfair Display' },
                    { id: 'serif-modern', label: 'Book', title: 'Lora / Georgia' },
                    { id: 'sans-modern', label: 'Clean', title: 'Inter' },
                    { id: 'sans-elegant', label: 'Design', title: 'Montserrat' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        console.log('Switching to font:', f.id);
                        setReaderFont(f.id as any);
                      }}
                      title={f.title}
                      className={cn(
                        "flex-1 h-10 flex items-center justify-center text-[9px] uppercase tracking-widest border transition-all duration-500",
                        readerFont === f.id 
                          ? "bg-luxury-text text-luxury-bg border-luxury-text shadow-lg font-bold" 
                          : "bg-transparent text-luxury-text/40 border-luxury-text/10 hover:border-luxury-gold hover:text-luxury-text"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setMode('vocab')}
                className="w-full flex items-center gap-3 bg-luxury-bg/90 backdrop-blur-md border border-luxury-text/20 px-6 py-4 hover:border-luxury-gold transition-all group shadow-sm"
              >
                <Book size={18} className="text-luxury-gold" />
                <span className="text-[10px] uppercase tracking-button font-bold text-luxury-muted group-hover:text-luxury-text">单词本</span>
              </button>
            </div>
            
            {/* 底部导航 - 悬浮控制 */}
            {paragraphs.length > 1 && (
              <div className="fixed bottom-12 left-16 flex items-center justify-between bg-luxury-bg/90 backdrop-blur-md border border-luxury-text/20 px-8 py-4 z-40 w-80">
                <button 
                  disabled={pageIndex === 0}
                  onClick={() => { setPageIndex(prev => prev - 1); setActiveWord(null); }}
                  className="text-luxury-text/40 hover:text-luxury-text disabled:opacity-10 transition-colors"
                >
                  <ChevronLeft size={24} strokeWidth={1} />
                </button>
                <div className="flex flex-col items-center">
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
            onNavigateToArticle={async (projectId, paraId, vocabId) => {
              await loadProject(projectId);
              // 使用 Service 获取最新的段落列表
              const paras = await projectService.getParagraphs(projectId);
              const paraIndex = paras.findIndex(p => p.id === paraId);
              setPageIndex(paraIndex >= 0 ? paraIndex : 0);
              setMode('present');
              
              // 如果有 vocabId，在下一轮渲染中触发词条展示
              if (vocabId) {
                setTimeout(async () => {
                  const vocabs = await vocabularyService.getSmartVocabulary(paraId);
                  const targetVocab = vocabs.find(v => v.id === vocabId);
                  if (targetVocab) {
                    setActiveWord(targetVocab);
                  }
                }, 100);
              }
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
