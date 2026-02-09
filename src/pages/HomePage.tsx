import React, { useState, useEffect } from 'react';
import { Plus, Download, Upload, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/useProjectStore';
import { db } from '../api/db';
import { projectService } from '../services';
import { ImportExportService, ExportData } from '../services/ImportExportService';
import { TemplateSelector } from '../components/common/TemplateSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_TEMPLATE } from '../config/templates';

// Toast 通知组件
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
      <span className="text-xxs uppercase tracking-widest font-bold">{message}</span>
    </motion.div>
  );
};

// 冲突选择弹窗
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
          <span className="text-xxs uppercase tracking-[0.3em] text-red-800 font-bold block">Conflict Detected</span>
          <h2 className="text-3xl font-serif tracking-tight">文章名称已存在</h2>
          <p className="text-sm text-luxury-muted">以下文章在您的库中已存在相同标题：</p>
          <ul className="text-sm font-bold text-luxury-text list-disc list-inside">
            {conflicts.map(c => <li key={c}>{c}</li>)}
          </ul>
        </header>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => onResolve('overwrite')}
            className="w-full py-5 border border-luxury-text hover:bg-luxury-text hover:text-luxury-bg transition-all uppercase text-xxs tracking-widest font-bold"
          >
            覆盖现有内容
          </button>
          <button
            onClick={() => onResolve('copy')}
            className="w-full py-5 bg-luxury-text text-luxury-bg hover:bg-luxury-gold transition-all uppercase text-xxs tracking-widest font-bold"
          >
            保留两者 (作为副本导入)
          </button>
        </div>

        <button onClick={onClose} className="w-full text-xxs uppercase tracking-widest font-bold text-luxury-muted hover:text-luxury-text py-2">
          取消导入
        </button>
      </div>
    </div>
  );
};

// 导入导出弹窗组件
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
    if (isOpen) setSelectedIds(items.map(i => i.id));
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
            <span className="text-xxs uppercase tracking-[0.3em] text-luxury-gold font-bold mb-2 block">Database Action</span>
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
              <div className="w-5 h-5 bg-luxury-gold flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-5 h-5 border border-luxury-muted" />
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
                  <div className="w-5 h-5 bg-luxury-gold flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-5 h-5 border border-luxury-muted/40" />
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

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentProject, loadProject, saveProject } = useProjectStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [projectCoverUrls, setProjectCoverUrls] = useState<Record<number, string>>({});

  // 导入导出相关的状态
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importData, setImportData] = useState<ExportData | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [conflictData, setConflictData] = useState<{ titles: string[]; importData: ExportData; selectedTitles: string[] } | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(DEFAULT_TEMPLATE);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const processImport = async (data: ExportData, titles: string[], strategy?: 'overwrite' | 'copy') => {
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
      if (project.coverImageData instanceof Blob && project.id && !projectCoverUrls[project.id]) {
        const url = URL.createObjectURL(project.coverImageData);
        setProjectCoverUrls(prev => ({ ...prev, [project.id]: url }));
      }
    });
  }, [projects]);

  // 加载项目列表
  useEffect(() => {
    const fetchAll = async () => {
      const all = await db.projects.toArray();
      setProjects(all);
    };
    fetchAll();
  }, [currentProject]);

  const handleCreateNew = () => {
    setSelectedTemplateId(DEFAULT_TEMPLATE);
    setIsTemplateModalOpen(true);
  };

  const handleConfirmCreate = async () => {
    const id = await saveProject('新建精读课程', undefined, { templateId: selectedTemplateId });
    await loadProject(id);
    setIsTemplateModalOpen(false);
    navigate('/edit');
  };

  const handleDeleteProject = async (id: number) => {
    if (confirm('确定要删除这篇文章吗？')) {
      await projectService.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSelectProject = async (projectId: number) => {
    await loadProject(projectId);
    navigate('/present');
  };

  const handleEditProject = async (e: React.MouseEvent, projectId: number) => {
    e.stopPropagation();
    await loadProject(projectId);
    navigate('/edit');
  };

  return (
    <>
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
                <span className="text-xxs uppercase tracking-widest font-bold">导入文章</span>
              </button>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center gap-3 px-6 py-4 bg-luxury-bg border border-luxury-text/10 hover:border-luxury-gold hover:bg-luxury-text/5 transition-all group"
              >
                <Upload size={18} className="text-luxury-gold group-hover:scale-110 transition-transform" />
                <span className="text-xxs uppercase tracking-widest font-bold">导出文章</span>
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
              onClick={() => handleSelectProject(project.id!)}
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
                    <span className="text-xxs uppercase tracking-widest text-luxury-muted font-bold">
                      {new Date(project.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                    </span>
                    <h3 className="text-xl font-serif leading-tight line-clamp-2 group-hover:text-luxury-gold transition-colors">{project.title}</h3>
                    {project.author && (
                      <p className="text-xs text-luxury-muted font-serif italic line-clamp-1">by {project.author}</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-luxury-text/5">
                    <div className="text-xxs uppercase tracking-button font-bold text-luxury-text group-hover:text-luxury-gold transition-all">
                      Read Story
                    </div>
                    <div className="flex gap-2 -mr-2">
                      <button
                        onClick={(e) => handleEditProject(e, project.id!)}
                        className="p-2 text-xxs uppercase tracking-widest font-bold text-luxury-muted hover:text-luxury-gold transition-colors flex items-center justify-center min-w-[44px]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id!); }}
                        className="p-2 text-xxs uppercase tracking-widest font-bold text-luxury-muted/40 hover:text-red-800 transition-colors flex items-center justify-center min-w-[44px]"
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

      {/* 模板选择模态框 */}
      <AnimatePresence>
        {isTemplateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-8"
            onClick={() => setIsTemplateModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-luxury-bg border border-luxury-text/10 shadow-2xl w-full max-w-5xl p-12"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 关闭按钮 */}
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="absolute top-8 right-8 p-2 text-luxury-text/40 hover:text-luxury-gold transition-colors"
              >
                <X size={24} strokeWidth={1.5} />
              </button>

              {/* 标题 */}
              <header className="mb-12 text-center">
                <span className="text-xxs uppercase tracking-[0.6em] text-luxury-gold font-bold block mb-4">Create New Project</span>
                <h2 className="text-5xl font-serif tracking-tighter">选择项目模板</h2>
                <p className="text-sm text-luxury-muted mt-4">选择适合的模板开始创建你的精读课程</p>
              </header>

              {/* 模板选择器 */}
              <TemplateSelector
                onSelect={setSelectedTemplateId}
                selectedTemplateId={selectedTemplateId}
              />

              {/* 确认按钮 */}
              <div className="mt-12 flex justify-center gap-6">
                <button
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="px-8 py-4 border border-luxury-text hover:bg-luxury-text/5 transition-all uppercase text-xxs tracking-widest font-bold"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmCreate}
                  className="px-12 py-4 bg-luxury-text text-luxury-bg hover:bg-luxury-gold transition-all uppercase text-xxs tracking-widest font-bold"
                >
                  确认创建
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
