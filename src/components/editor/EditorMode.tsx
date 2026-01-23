import React, { useState, useEffect, useMemo } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { db, Vocabulary, Paragraph } from '../../api/db';
import { Plus, Save, Trash2, Image as ImageIcon, ChevronRight, ChevronDown, List, BookOpen, Check, Upload, X as CloseIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 辅助函数：在编辑器中渲染带高亮的文本
const HighlightedText: React.FC<{ text: string; vocab: Vocabulary[]; isActive: boolean }> = ({ text, vocab, isActive }) => {
  const segments = useMemo(() => {
    if (!text) return [];
    // 使用与 ReaderEngine 类似的分词逻辑
    return text.split(/(\s+|[.,!?;:()])/g).filter(Boolean);
  }, [text]);

  return (
    <div className="w-full min-h-40 text-xl font-serif leading-relaxed whitespace-pre-wrap break-words pointer-events-none">
      {segments.map((segment, index) => {
        const cleanWord = segment.replace(/[.,!?;:()]/g, '').toLowerCase();
        const isMatched = vocab.some(hw => {
          const isExact = hw.word.toLowerCase() === cleanWord;
          const isPattern = hw.matchPattern?.split(',')
            .map(p => p.trim().toLowerCase())
            .includes(cleanWord);
          return isExact || isPattern;
        });

        if (isMatched) {
          return (
            <span key={index} className="bg-luxury-gold/20 border-b-2 border-luxury-gold/50 text-luxury-text font-medium">
              {segment}
            </span>
          );
        }
        return <span key={index} className="text-luxury-text/80">{segment}</span>;
      })}
    </div>
  );
};

export const EditorMode: React.FC = () => {
  const { 
    currentProject, 
    paragraphs, 
    saveProject, 
    addParagraph, 
    updateParagraph, 
    deleteParagraph,
    getVocabForParagraph,
    saveVocab,
    deleteVocab
  } = useProjectStore();

  const [activeParaId, setActiveParaId] = useState<number | null>(null);
  const [paraVocab, setParaVocab] = useState<Vocabulary[]>([]);
  const [allVocab, setAllVocab] = useState<Record<number, Vocabulary[]>>({}); // 存储所有段落的词汇
  const [editingVocab, setEditingVocab] = useState<Partial<Vocabulary>>({
    word: '', phonetic: '', definition: '', translation: '', examples: ['']
  });
  const [localTitle, setLocalTitle] = useState(currentProject?.title || '');

  // 当外部 project 变化时更新本地 title
  useEffect(() => {
    if (currentProject?.title) {
      setLocalTitle(currentProject.title);
    }
  }, [currentProject?.id]);

  const handleTitleBlur = () => {
    if (localTitle !== currentProject?.title) {
      saveProject(localTitle, currentProject?.id);
    }
  };

  // 初始自动激活第一个段落
  useEffect(() => {
    if (paragraphs.length > 0 && !activeParaId) {
      setActiveParaId(paragraphs[0].id!);
    }
  }, [paragraphs, activeParaId]);

  // 加载所有段落的词汇以便高亮
  const fetchAllVocab = async () => {
    const vocabMap: Record<number, Vocabulary[]> = {};
    for (const para of paragraphs) {
      if (para.id) {
        vocabMap[para.id] = await getVocabForParagraph(para.id);
      }
    }
    setAllVocab(vocabMap);
  };

  useEffect(() => {
    if (paragraphs.length > 0) {
      fetchAllVocab();
    }
  }, [paragraphs]);

  useEffect(() => {
    if (activeParaId) {
      getVocabForParagraph(activeParaId).then(setParaVocab);
    }
  }, [activeParaId]);

  const handleAddParagraph = async () => {
    if (!currentProject?.id) return;
    const newId = await addParagraph(currentProject.id, paragraphs.length);
    if (newId) setActiveParaId(newId);
  };

  const handleSaveVocab = async () => {
    if (!activeParaId || !editingVocab.word) return;
    await saveVocab({
      ...editingVocab,
      paragraphId: activeParaId,
      examples: editingVocab.examples?.filter(e => e.trim() !== '') || []
    } as Vocabulary);
    const updated = await getVocabForParagraph(activeParaId);
    setParaVocab(updated);
    setAllVocab(prev => ({ ...prev, [activeParaId]: updated })); // 同步更新全局词汇
    setEditingVocab({ word: '', phonetic: '', definition: '', translation: '', examples: [''] });
  };

  const handleEditVocab = (vocab: Vocabulary) => {
    setEditingVocab(vocab);
    // 滚动到顶部编辑区域（可选）
    const sidePanel = document.querySelector('.right-panel-content');
    if (sidePanel) sidePanel.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteVocab = async (id: number) => {
    if (!activeParaId) return;
    await deleteVocab(id);
    const updated = await getVocabForParagraph(activeParaId);
    setParaVocab(updated);
    setAllVocab(prev => ({ ...prev, [activeParaId]: updated }));
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-luxury-bg overflow-hidden relative z-10 font-serif">
      {/* 左侧：内容管理 */}
      <div className="w-[70%] overflow-y-auto p-16 border-r border-luxury-text/20 custom-scrollbar">
        <header className="flex flex-col gap-8 mb-20">
          <div className="flex justify-between items-end">
            <div className="space-y-4 flex-1 mr-12">
              <span className="text-[10px] uppercase tracking-[0.4em] text-luxury-gold font-bold">文章标题</span>
              <input 
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={handleTitleBlur}
                className="w-full text-6xl font-serif bg-transparent border-b border-luxury-text/20 focus:border-luxury-gold outline-none pb-4 transition-colors"
                placeholder="请输入文章标题"
              />
            </div>
            <button 
              onClick={handleAddParagraph}
              className="bg-[#D3CBB2] text-luxury-text px-8 py-4 text-[10px] uppercase tracking-button font-bold hover:brightness-90 transition-all duration-500 flex items-center gap-3 shadow-sm"
            >
              <Plus size={14} />
              添加段落
            </button>
          </div>
        </header>

        <div className="space-y-24">
          {paragraphs.map((para, idx) => (
            <div 
              key={para.id} 
              onClick={() => setActiveParaId(para.id!)}
              className={cn(
                "group relative transition-all duration-700 p-8 border border-transparent",
                activeParaId === para.id ? "bg-luxury-paper/10 border-luxury-text/5 opacity-100" : "opacity-60 hover:opacity-100"
              )}
            >
              <div className="flex gap-12">
                <div className="flex flex-col items-center gap-4">
                  <span className={cn(
                    "font-serif italic text-2xl transition-colors",
                    activeParaId === para.id ? "text-luxury-gold" : "text-luxury-muted"
                  )}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="w-px flex-1 bg-luxury-text/10" />
                </div>
                
                <div className="flex-1 space-y-8">
                  <div className="relative group/text">
                    {/* 高亮层 - 负责支撑高度，必须与 textarea 样式完全一致 */}
                    <div className="min-h-40 pb-4">
                      <HighlightedText 
                        text={para.content} 
                        vocab={allVocab[para.id!] || []} 
                        isActive={activeParaId === para.id}
                      />
                    </div>
                    
                    {/* 编辑层 - 绝对定位，高度跟随高亮层，文字透明 */}
                    <textarea 
                      value={para.content}
                      onChange={(e) => updateParagraph(para.id!, { content: e.target.value })}
                      placeholder="在此输入段落内容..."
                      className={cn(
                        "absolute inset-0 w-full h-full bg-transparent text-xl font-serif leading-relaxed outline-none resize-none placeholder:italic placeholder:text-luxury-muted/30 z-10",
                        "text-transparent caret-luxury-text selection:bg-luxury-gold/30 p-0 m-0 border-none"
                      )}
                    />
                  </div>
                  
                  <div className="flex items-center gap-12 pt-4 border-t border-luxury-text/5">
                    <div className="flex-1 flex items-center gap-4">
                      <ImageIcon size={14} className="text-luxury-gold" />
                      <input 
                        type="text"
                        value={para.image || ''}
                        onChange={(e) => updateParagraph(para.id!, { image: e.target.value, imageData: undefined })}
                        placeholder="远程图片地址 (URL)"
                        className="flex-1 bg-transparent text-[10px] uppercase tracking-widest outline-none"
                      />
                    </div>

                    <label className="cursor-pointer text-[10px] uppercase tracking-widest font-bold bg-[#D3CBB2]/20 px-3 py-1 hover:bg-[#D3CBB2] transition-colors flex items-center gap-2">
                      <Upload size={12} />
                      {para.imageData ? '已上传本地图片' : '上传本地图片'}
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) updateParagraph(para.id!, { imageData: file, image: '' });
                        }}
                      />
                    </label>

                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteParagraph(para.id!); }}
                      className="text-luxury-text/40 hover:text-red-800 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧：词库管理 */}
      <div className="w-[30%] overflow-y-auto p-16 bg-luxury-paper/30 custom-scrollbar right-panel-content">
        {activeParaId ? (
          <div className="space-y-16">
            <header className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.4em] text-luxury-gold font-bold">词库管理</span>
              <h3 className="text-4xl font-serif">第 {paragraphs.findIndex(p => p.id === activeParaId) + 1} 段</h3>
            </header>

            <div className="space-y-8">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <input 
                    placeholder="拼写" 
                    value={editingVocab.word}
                    onChange={e => setEditingVocab({...editingVocab, word: e.target.value})}
                    className="bg-transparent border-b border-luxury-text/20 focus:border-luxury-gold outline-none py-2 text-2xl font-serif"
                  />
                  <input 
                    placeholder="词性 (n./v./adj....)" 
                    value={editingVocab.partOfSpeech}
                    onChange={e => setEditingVocab({...editingVocab, partOfSpeech: e.target.value})}
                    className="bg-transparent border-b border-luxury-text/20 focus:border-luxury-gold outline-none py-2 text-xs text-luxury-muted italic font-serif"
                  />
                </div>
                <input 
                  placeholder="匹配模式 (例如: erupted, erupts... 用逗号隔开)" 
                  value={editingVocab.matchPattern}
                  onChange={e => setEditingVocab({...editingVocab, matchPattern: e.target.value})}
                  className="w-full bg-transparent border-b border-luxury-text/20 focus:border-luxury-gold outline-none py-2 text-[10px] text-luxury-muted tracking-wide"
                />
                <input 
                  placeholder="音标" 
                  value={editingVocab.phonetic}
                  onChange={e => setEditingVocab({...editingVocab, phonetic: e.target.value})}
                  className="w-full bg-transparent border-b border-luxury-text/20 focus:border-luxury-gold outline-none py-2 font-serif italic text-luxury-gold"
                />
                <textarea 
                  placeholder="英文释义" 
                  value={editingVocab.definition}
                  onChange={e => setEditingVocab({...editingVocab, definition: e.target.value})}
                  className="w-full bg-transparent border-b border-luxury-text/20 focus:border-luxury-gold outline-none py-2 text-sm h-24 resize-none"
                />
                <input 
                  placeholder="中文意思" 
                  value={editingVocab.translation}
                  onChange={e => setEditingVocab({...editingVocab, translation: e.target.value})}
                  className="w-full bg-transparent border-b border-luxury-text/20 focus:border-luxury-gold outline-none py-2 font-bold"
                />
                <button 
                  onClick={handleSaveVocab}
                  className="w-full bg-[#D3CBB2] text-luxury-text py-4 text-[10px] uppercase tracking-button font-bold hover:brightness-90 transition-all duration-500 shadow-sm"
                >
                  {editingVocab.id ? '更新词条' : '确认添加'}
                </button>
                {editingVocab.id && (
                  <button 
                    onClick={() => setEditingVocab({ word: '', phonetic: '', definition: '', translation: '', examples: [''] })}
                    className="w-full border border-luxury-text/20 text-luxury-text py-2 text-[10px] uppercase tracking-button font-bold hover:bg-[#D3CBB2]/30 transition-all duration-500"
                  >
                    取消编辑
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <span className="text-[10px] uppercase tracking-widest text-luxury-muted font-bold">已收录词汇</span>
                <div className="grid grid-cols-1 gap-4">
                  {paraVocab.map(v => (
                    <div key={v.id} className="p-6 border border-luxury-text/5 bg-luxury-bg group relative hover:border-luxury-gold transition-colors duration-500 cursor-pointer" onClick={() => handleEditVocab(v)}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteVocab(v.id!); }}
                        className="absolute top-4 right-4 text-luxury-text/20 hover:text-red-800 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-serif text-xl">{v.word}</span>
                        <span className="text-[10px] text-luxury-muted italic font-serif">{v.partOfSpeech}</span>
                      </div>
                      <div className="text-[10px] text-luxury-gold uppercase tracking-widest font-bold">{v.translation}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-luxury-muted/30 space-y-8">
            <BookOpen size={64} strokeWidth={0.5} />
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold">请选择一个段落进行编辑</p>
          </div>
        )}
      </div>
    </div>
  );
};
