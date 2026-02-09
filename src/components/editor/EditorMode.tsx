import React, { useState, useEffect, useMemo } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { db, Vocabulary, Paragraph } from '../../api/db';
import { Plus, Save, Trash2, Image as ImageIcon, ChevronRight, ChevronDown, List, BookOpen, Check, Upload, X as CloseIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { VocabularyForm } from './VocabularyForm';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 辅助函数：在编辑器中渲染带高亮的文本
const HighlightedText: React.FC<{ 
  text: string; 
  vocab: Vocabulary[]; 
  isActive: boolean;
  onVocabClick?: (vocab: Vocabulary) => void;
}> = ({ text, vocab, isActive, onVocabClick }) => {
  const segments = useMemo(() => {
    if (!text) return [];
    // 改进的分词逻辑：将标点符号合并到前面的单词中，与 ReaderEngine 一致
    const rawSegments = text.split(/(\s+|[.,!?;:()])/g).filter(Boolean);
    const result: any[] = [];
    
    for (let i = 0; i < rawSegments.length; i++) {
      const current = rawSegments[i];
      const next = rawSegments[i + 1];
      
      const isSpace = /^\s+$/.test(current);
      const isPunct = /^[.,!?;:()]$/.test(current);
      
      if (!isSpace && !isPunct && next && /^[.,!?;:()]$/.test(next)) {
        result.push({
          type: 'word-with-punct',
          word: current,
          punct: next,
          index: i
        });
        i++;
      } else {
        result.push({
          type: isSpace ? 'space' : (isPunct ? 'punct' : 'word'),
          content: current,
          index: i
        });
      }
    }
    return result;
  }, [text]);

  const segmentVocabMap = useMemo(() => {
    const map: Record<number, Vocabulary> = {};
    if (vocab.length === 0) return map;

    // 按长度降序排列，优先匹配长词组
    const sortedVocabs = [...vocab].sort((a, b) => b.word.length - a.word.length);

    sortedVocabs.forEach(v => {
      const patterns = [v.word, ...(v.matchPattern?.split(/[,，]/).map(p => p.trim()) || [])]
        .filter(Boolean)
        .map(p => p.toLowerCase());

      patterns.forEach(pattern => {
        // 支持不连续匹配，使用 '...' 作为分隔符
        const parts = pattern.split('...');
        const partWordsList = parts.map(p => p.trim().split(/\s+/).filter(Boolean));
        if (partWordsList.length === 0 || partWordsList[0].length === 0) return;
        
        // 在 segments 中寻找匹配
        for (let i = 0; i < segments.length; i++) {
          let currentSegIdx = i;
          let matchedAllParts = true;
          const rangesToMark: {start: number, end: number}[] = [];

          for (let pIdx = 0; pIdx < partWordsList.length; pIdx++) {
            const partWords = partWordsList[pIdx];
            let partFound = false;

            // 搜索限制：后续部分最多往后找 15 个词（约 30 个 segments）
            const searchLimit = pIdx === 0 ? i + 1 : currentSegIdx + 30;

            for (let searchIdx = (pIdx === 0 ? i : currentSegIdx); searchIdx < Math.min(segments.length, searchLimit); searchIdx++) {
              let gIdx = searchIdx;
              let wIdx = 0;
              const currentPartIndices: number[] = [];

              while (wIdx < partWords.length && gIdx < segments.length) {
                const seg = segments[gIdx];
                if (seg.type === 'space') {
                  gIdx++;
                  continue;
                }
                const currentWord = (seg.word || seg.content || '').toLowerCase();
                if (currentWord === partWords[wIdx]) {
                  currentPartIndices.push(gIdx);
                  wIdx++;
                  gIdx++;
                } else {
                  break;
                }
              }

              if (wIdx === partWords.length) {
                partFound = true;
                const first = currentPartIndices[0];
                const last = currentPartIndices[currentPartIndices.length - 1];
                rangesToMark.push({ start: first, end: last });
                currentSegIdx = gIdx;
                break;
              }
              if (pIdx === 0) break;
            }

            if (!partFound) {
              matchedAllParts = false;
              break;
            }
          }

          if (matchedAllParts) {
            // 找到完整匹配，标记所有相关索引
            rangesToMark.forEach(range => {
              for (let k = range.start; k <= range.end; k++) {
                if (!map[k]) {
                  map[k] = v;
                }
              }
            });
          }
        }
      });
    });

    return map;
  }, [segments, vocab]);

  return (
    <div className="w-full min-h-40 text-xl font-serif leading-relaxed whitespace-pre-wrap break-words relative">
      {segments.map((segment, index) => {
        const vocabEntry = segmentVocabMap[index];

        if (vocabEntry) {
          const highlightColor = vocabEntry.color || '#E2B933';
          return (
            <span 
              key={index} 
              className="font-medium cursor-pointer pointer-events-auto relative z-20"
              style={{ 
                backgroundColor: `${highlightColor}33`, // 20% opacity
                borderBottom: `4px solid ${highlightColor}80` // 50% opacity, thicker for better visibility
              }}
              onClick={(e) => {
                e.stopPropagation();
                onVocabClick?.(vocabEntry);
              }}
            >
              {segment.content || (segment.word + segment.punct)}
            </span>
          );
        }
        return <span key={index} className="text-luxury-text/80 pointer-events-none">{segment.content || (segment.word + segment.punct)}</span>;
      })}
    </div>
  );
};

interface EditorModeProps {
  initialParagraphId?: number;
  initialEditVocabId?: number;
}

export const EditorMode: React.FC<EditorModeProps> = ({ initialParagraphId, initialEditVocabId }) => {
  const { 
    currentProject, 
    paragraphs, 
    saveProject, 
    addParagraph, 
    updateParagraph, 
    deleteParagraph,
    getVocabForParagraph,
    saveVocab,
    deleteVocab,
    excludeWord,
    includeWord
  } = useProjectStore();

  const [activeParaId, setActiveParaId] = useState<number | null>(null);
  const [paraVocab, setParaVocab] = useState<(Vocabulary & { isGlobal?: boolean })[]>([]);
  const [allVocab, setAllVocab] = useState<Record<number, (Vocabulary & { isGlobal?: boolean })[]>>({}); // 存储所有段落的词汇
  const [editingVocab, setEditingVocab] = useState<Partial<Vocabulary>>({
    word: '', phonetic: '', definition: '', translation: '', examples: [''], color: '#E2B933',
    // 新增字段初始化
    explanation: '', extendedReading: '', referenceLink: [], relatedConcepts: [], sourceReference: ''
  });

  // 段落图片 objectUrl 管理
  const [paragraphImageUrls, setParagraphImageUrls] = useState<Record<number, string>>({});

  useEffect(() => {
    paragraphs.forEach(para => {
      if (para.imageData instanceof Blob && para.id && !paragraphImageUrls[para.id]) {
        const url = URL.createObjectURL(para.imageData);
        setParagraphImageUrls(prev => ({ ...prev, [para.id!]: url }));
      }
    });
    return () => {
      Object.values(paragraphImageUrls).forEach(URL.revokeObjectURL);
    };
  }, [paragraphs]);

  const presetColors = [
    { name: '金', value: '#E2B933' },
    { name: '绿', value: '#9BA876' },
    { name: '红', value: '#CD8D8B' },
    { name: '蓝', value: '#7996AC' },
    { name: '橙', value: '#C26D56' },
  ];
  const [localTitle, setLocalTitle] = useState(currentProject?.title || '');
  const [localAuthor, setLocalAuthor] = useState(currentProject?.author || '');

  // 当外部 project 变化时更新本地 title 和 author
  useEffect(() => {
    if (currentProject?.title) {
      setLocalTitle(currentProject.title);
    }
    if (currentProject?.author !== undefined) {
      setLocalAuthor(currentProject.author);
    }
  }, [currentProject?.id]);

  const handleTitleBlur = () => {
    if (localTitle !== currentProject?.title) {
      saveProject(localTitle, currentProject?.id);
    }
  };

  const handleAuthorBlur = () => {
    if (localAuthor !== currentProject?.author) {
      saveProject(localTitle, currentProject?.id, { author: localAuthor });
    }
  };

  // 项目封面图 objectUrl 管理
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (currentProject?.coverImageData instanceof Blob) {
      const url = URL.createObjectURL(currentProject.coverImageData);
      setCoverImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (currentProject?.coverImage) {
      setCoverImageUrl(currentProject.coverImage);
    } else {
      setCoverImageUrl(null);
    }
  }, [currentProject?.coverImageData, currentProject?.coverImage, currentProject?.id]);

  const handleUpdateCover = async (data: { coverImage?: string; coverImageData?: Blob }) => {
    if (!currentProject?.id) return;
    // 这里需要扩展 saveProject 以支持封面更新，或者直接在 store 中添加 updateProjectCover
    // 为了保持一致性，我们假设 saveProject 可以处理更多参数，或者通过 updateParagraph 的模式
    // 但 Store 目前只有 saveProject(title, id)。我们需要去扩展 Store。
  };

  // 初始自动激活第一个段落
  useEffect(() => {
    if (paragraphs.length > 0 && !activeParaId) {
      setActiveParaId(paragraphs[0].id!);
    }
  }, [paragraphs, activeParaId]);

  // 处理从单词本传入的初始参数
  useEffect(() => {
    if (initialParagraphId) {
      setActiveParaId(initialParagraphId);
    }
  }, [initialParagraphId]);

  // 加载所有段落的词汇以便高亮
  const fetchAllVocab = async () => {
    const vocabMap: Record<number, (Vocabulary & { isGlobal?: boolean })[]> = {};
    for (const para of paragraphs) {
      if (para.id) {
        vocabMap[para.id] = await getVocabForParagraph(para.id, true);
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
      getVocabForParagraph(activeParaId, true).then(setParaVocab);
    }
  }, [activeParaId]);

  const handleAddParagraph = async () => {
    if (!currentProject?.id) return;
    const newId = await addParagraph(currentProject.id, paragraphs.length);
    if (newId) setActiveParaId(newId);
  };

  // 词条卡片图片 objectUrl 管理
  const [vocabImageUrls, setVocabImageUrls] = useState<Record<number, string>>({});

  useEffect(() => {
    paraVocab.forEach(v => {
      if (v.imageData instanceof Blob && v.id && !vocabImageUrls[v.id]) {
        const url = URL.createObjectURL(v.imageData);
        setVocabImageUrls(prev => ({ ...prev, [v.id!]: url }));
      }
    });
    return () => {
      // 这里的清理逻辑需要小心，因为 useEffect 会在每次 paraVocab 改变时运行
      // 实际上在卸载时统一清理即可
    };
  }, [paraVocab]);

  const handleSaveVocab = async () => {
    if (!activeParaId || !editingVocab.word) return;
    
    // 清理旧的 objectUrl (如果是替换)
    if (editingVocab.id && vocabImageUrls[editingVocab.id]) {
      URL.revokeObjectURL(vocabImageUrls[editingVocab.id]);
      setVocabImageUrls(prev => {
        const next = { ...prev };
        delete next[editingVocab.id!];
        return next;
      });
    }

    await saveVocab({
      ...editingVocab,
      paragraphId: activeParaId,
      examples: editingVocab.examples?.filter(e => e.trim() !== '') || [],
      color: editingVocab.color || '#E2B933'
    } as Vocabulary);
    const updated = await getVocabForParagraph(activeParaId);
    setParaVocab(updated);
    setAllVocab(prev => ({ ...prev, [activeParaId]: updated })); // 同步更新全局词汇
    handleNewVocab();
  };

  const handleNewVocab = () => {
    setEditingVocab({ 
      word: '', phonetic: '', definition: '', translation: '', examples: [''], color: '#E2B933',
      explanation: '', extendedReading: '', referenceLink: [], relatedConcepts: [], sourceReference: ''
    });
    setLastSavedVocab(''); // 重置对比内容
  };

  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedVocab, setLastSavedVocab] = useState<string>('');

  // 词条自动保存逻辑
  useEffect(() => {
    if (!editingVocab.id || !activeParaId) return;

    // 将当前编辑内容序列化，用于比较是否真的发生了变化
    const currentContent = JSON.stringify({
      word: editingVocab.word,
      phonetic: editingVocab.phonetic,
      partOfSpeech: editingVocab.partOfSpeech,
      matchPattern: editingVocab.matchPattern,
      definition: editingVocab.definition,
      translation: editingVocab.translation,
      examples: editingVocab.examples,
      color: editingVocab.color,
      image: editingVocab.image,
      // 新增字段
      explanation: editingVocab.explanation,
      extendedReading: editingVocab.extendedReading,
      referenceLink: editingVocab.referenceLink,
      relatedConcepts: editingVocab.relatedConcepts,
      sourceReference: editingVocab.sourceReference,
      contextualExamples: editingVocab.contextualExamples,
      // imageData 无法简单序列化，暂不包含在简单对比中
    });

    // 如果内容没变（比如刚点击编辑加载进来时），不触发保存
    if (currentContent === lastSavedVocab) return;

    const timer = setTimeout(async () => {
      setIsAutoSaving(true);
      try {
        await saveVocab({
          ...editingVocab,
          paragraphId: activeParaId,
          examples: editingVocab.examples?.filter(e => e.trim() !== '') || [],
          color: editingVocab.color || '#E2B933'
        } as Vocabulary);
        
        // 更新本地列表和缓存，不重置编辑状态
        const updated = await getVocabForParagraph(activeParaId, true);
        setParaVocab(updated);
        setAllVocab(prev => ({ ...prev, [activeParaId]: updated }));
        setLastSavedVocab(currentContent);
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setIsAutoSaving(false);
      }
    }, 1000); // 1秒防抖

    return () => clearTimeout(timer);
  }, [editingVocab, activeParaId, lastSavedVocab]);

  const handleEditVocab = (vocab: Vocabulary) => {
    const data = {
      ...vocab,
      examples: vocab.examples && vocab.examples.length > 0 ? vocab.examples : [''],
      color: vocab.color || '#E2B933',
      // 确保新字段有默认值
      explanation: vocab.explanation || '',
      extendedReading: vocab.extendedReading || '',
      referenceLink: vocab.referenceLink || [],
      relatedConcepts: vocab.relatedConcepts || [],
      sourceReference: vocab.sourceReference || ''
    };
    setEditingVocab(data);
    setLastSavedVocab(JSON.stringify({
      word: data.word,
      phonetic: data.phonetic,
      partOfSpeech: data.partOfSpeech,
      matchPattern: data.matchPattern,
      definition: data.definition,
      translation: data.translation,
      examples: data.examples,
      color: data.color,
      image: data.image,
      explanation: data.explanation,
      extendedReading: data.extendedReading,
      referenceLink: data.referenceLink,
      relatedConcepts: data.relatedConcepts,
      sourceReference: data.sourceReference,
      contextualExamples: data.contextualExamples
    }));
    // 滚动到顶部编辑区域（可选）
    const sidePanel = document.querySelector('.right-panel-content');
    if (sidePanel) sidePanel.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 处理从单词本传入的编辑词汇
  useEffect(() => {
    if (initialEditVocabId && activeParaId) {
      const loadVocabForEdit = async () => {
        const allVocab = await getVocabForParagraph(activeParaId, true);
        const vocabToEdit = allVocab.find(v => v.id === initialEditVocabId);
        if (vocabToEdit) {
          handleEditVocab(vocabToEdit);
        }
      };
      loadVocabForEdit();
    }
  }, [initialEditVocabId, activeParaId]);

  const handleDeleteVocab = async (id: number) => {
    if (!activeParaId) return;
    await deleteVocab(id);
    const updated = await getVocabForParagraph(activeParaId);
    setParaVocab(updated);
    setAllVocab(prev => ({ ...prev, [activeParaId]: updated }));
  };

  const handleAddExample = () => {
    setEditingVocab(prev => ({
      ...prev,
      examples: [...(prev.examples || []), '']
    }));
  };

  const handleUpdateExample = (index: number, value: string) => {
    const newExamples = [...(editingVocab.examples || [])];
    newExamples[index] = value;
    setEditingVocab(prev => ({
      ...prev,
      examples: newExamples
    }));
  };

  const handleRemoveExample = (index: number) => {
    const newExamples = (editingVocab.examples || []).filter((_, i) => i !== index);
    setEditingVocab(prev => ({
      ...prev,
      examples: newExamples.length > 0 ? newExamples : ['']
    }));
  };

  // 为当前激活段落计算实际匹配到的词汇 ID 集合，用于侧边栏过滤
  const matchedVocabIds = useMemo(() => {
    const activePara = paragraphs.find(p => p.id === activeParaId);
    if (!activePara || !paraVocab.length) return new Set<number>();

    const text = activePara.content;
    // 使用与 HighlightedText 相同的分词逻辑
    const rawSegments = text.split(/(\s+|[.,!?;:()])/g).filter(Boolean);
    const segments: any[] = [];
    for (let i = 0; i < rawSegments.length; i++) {
      const current = rawSegments[i];
      const next = rawSegments[i + 1];
      const isSpace = /^\s+$/.test(current);
      const isPunct = /^[.,!?;:()]$/.test(current);
      if (!isSpace && !isPunct && next && /^[.,!?;:()]$/.test(next)) {
        segments.push({ type: 'word-with-punct', word: current, punct: next, index: i });
        i++;
      } else {
        segments.push({ type: isSpace ? 'space' : (isPunct ? 'punct' : 'word'), content: current, index: i });
      }
    }

    const matched = new Set<number>();
    const sortedVocabs = [...paraVocab].sort((a, b) => b.word.length - a.word.length);

    sortedVocabs.forEach(v => {
      const patterns = [v.word, ...(v.matchPattern?.split(/[,，]/).map(p => p.trim()) || [])]
        .filter(Boolean)
        .map(p => p.toLowerCase());

      patterns.forEach(pattern => {
        const parts = pattern.split('...');
        const partWordsList = parts.map(p => p.trim().split(/\s+/).filter(Boolean));
        if (partWordsList.length === 0 || partWordsList[0].length === 0) return;
        
        for (let i = 0; i < segments.length; i++) {
          let currentSegIdx = i;
          let matchedAllParts = true;
          for (let pIdx = 0; pIdx < partWordsList.length; pIdx++) {
            const partWords = partWordsList[pIdx];
            let partFound = false;
            const searchLimit = pIdx === 0 ? i + 1 : currentSegIdx + 30;
            for (let searchIdx = (pIdx === 0 ? i : currentSegIdx); searchIdx < Math.min(segments.length, searchLimit); searchIdx++) {
              let gIdx = searchIdx;
              let wIdx = 0;
              while (wIdx < partWords.length && gIdx < segments.length) {
                const seg = segments[gIdx];
                if (seg.type === 'space') { gIdx++; continue; }
                const currentWord = (seg.word || seg.content || '').toLowerCase();
                if (currentWord === partWords[wIdx]) { wIdx++; gIdx++; } else { break; }
              }
              if (wIdx === partWords.length) { partFound = true; currentSegIdx = gIdx; break; }
              if (pIdx === 0) break;
            }
            if (!partFound) { matchedAllParts = false; break; }
          }
          if (matchedAllParts) {
            matched.add(v.id!);
            return;
          }
        }
      });
    });

    return matched;
  }, [activeParaId, paragraphs, paraVocab]);

  return (
    <div className="flex h-[calc(100vh-80px)] bg-luxury-bg overflow-hidden relative z-10 font-serif">
      {/* 左侧：内容管理 */}
      <div className="w-[70%] overflow-y-auto p-16 border-r border-luxury-text/20 custom-scrollbar">
        <header className="flex flex-col gap-8 mb-20">
          <div className="flex justify-between items-end">
            <div className="space-y-4 flex-1 mr-12">
              <span className="text-xxs uppercase tracking-[0.4em] text-luxury-gold font-bold">文章封面与标题</span>
              <div className="flex gap-8 items-start">
                {/* 封面编辑 */}
                <div className="w-32 h-44 bg-luxury-paper/30 border border-luxury-text/10 overflow-hidden relative group/cover cursor-pointer shrink-0">
                  {coverImageUrl ? (
                    <img src={coverImageUrl} className="w-full h-full object-cover grayscale group-hover/cover:grayscale-0 transition-all" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-luxury-muted/40">
                      <ImageIcon size={24} strokeWidth={1} />
                      <span className="text-xxs mt-2">NO COVER</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-luxury-bg/80 opacity-0 group-hover/cover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center gap-2">
                    <label className="text-xxs font-bold tracking-widest cursor-pointer hover:text-luxury-gold">
                      UPLOAD
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file && currentProject?.id) saveProject(localTitle, currentProject.id, { author: localAuthor, coverImageData: file, coverImage: '' });
                        }}
                      />
                    </label>
                    <button
                      className="text-xxs font-bold tracking-widest hover:text-red-800"
                      onClick={() => currentProject?.id && saveProject(localTitle, currentProject.id, { author: localAuthor, coverImage: '', coverImageData: undefined })}
                    >
                      REMOVE
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-4 pt-2">
                  <input
                    type="text"
                    value={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    className="w-full text-4xl font-serif bg-transparent border-b border-luxury-text/20 focus:border-luxury-gold outline-none pb-4 transition-colors"
                    placeholder="请输入文章标题"
                  />
                  <input
                    type="text"
                    value={localAuthor}
                    onChange={(e) => setLocalAuthor(e.target.value)}
                    onBlur={handleAuthorBlur}
                    className="w-full text-xl font-serif bg-transparent border-b border-luxury-text/10 focus:border-luxury-gold outline-none py-2 transition-colors"
                    placeholder="作者（可选）"
                  />
                  <div className="flex items-center gap-4">
                    <ImageIcon size={14} className="text-luxury-gold" />
                    <input
                      type="text"
                      placeholder="或输入远程封面 URL"
                      value={currentProject?.coverImage || ''}
                      onChange={e => currentProject?.id && saveProject(localTitle, currentProject.id, { author: localAuthor, coverImage: e.target.value, coverImageData: undefined })}
                      className="flex-1 bg-transparent text-xxs uppercase tracking-widest outline-none border-b border-luxury-text/5 focus:border-luxury-gold transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={handleAddParagraph}
              className="bg-[#D3CBB2] text-luxury-text px-8 py-4 text-xxs uppercase tracking-button font-bold hover:brightness-90 transition-all duration-500 flex items-center gap-3 shadow-sm"
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
                        onVocabClick={handleEditVocab}
                      />
                    </div>
                    
                    {/* 编辑层 - 绝对定位，高度跟随高亮层，文字透明 */}
                    <textarea 
                      value={para.content}
                      onChange={(e) => {
                        const target = e.target;
                        const start = target.selectionStart;
                        const end = target.selectionEnd;
                        
                        updateParagraph(para.id!, { content: target.value });
                        
                        // 使用 requestAnimationFrame 确保在 React 重新渲染后恢复光标位置
                        requestAnimationFrame(() => {
                          target.setSelectionRange(start, end);
                        });
                      }}
                      placeholder="在此输入段落内容..."
                      className={cn(
                        "absolute inset-0 w-full h-full bg-transparent text-xl font-serif leading-relaxed outline-none resize-none placeholder:italic placeholder:text-luxury-muted/30 z-10",
                        "text-transparent caret-luxury-text selection:bg-luxury-gold/30 p-0 m-0 border-none"
                      )}
                    />
                  </div>
                  
                  <div className="flex items-center gap-12 pt-4 border-t border-luxury-text/5">
                    <div className="flex-1 flex flex-col gap-4">
                      {/* 图片预览 */}
                      {(para.imageData || para.image) && (
                        <div className="w-32 h-20 bg-luxury-paper/20 border border-luxury-text/10 overflow-hidden group/img relative">
                          <img 
                            src={para.imageData ? paragraphImageUrls[para.id!] : para.image} 
                            alt="Preview" 
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-luxury-bg/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              onClick={() => updateParagraph(para.id!, { image: '', imageData: undefined })}
                              className="p-1 bg-red-800 text-white rounded-full hover:scale-110 transition-transform"
                              title="移除图片"
                            >
                              <CloseIcon size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4">
                        <ImageIcon size={14} className="text-luxury-gold" />
                        <input 
                          type="text"
                          value={para.image || ''}
                          onChange={(e) => updateParagraph(para.id!, { image: e.target.value, imageData: undefined })}
                          placeholder="或输入远程图片地址 (URL)"
                          className="flex-1 bg-transparent text-xxs uppercase tracking-widest outline-none border-b border-luxury-text/10 focus:border-luxury-gold transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end">
                      <label className="cursor-pointer text-xxs uppercase tracking-widest font-bold bg-luxury-gold/10 text-luxury-gold px-3 py-1 hover:bg-luxury-gold hover:text-luxury-bg transition-all flex items-center gap-2">
                        <Upload size={12} />
                        {para.imageData || para.image ? '替换图片' : '上传本地图片'}
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (para.id && paragraphImageUrls[para.id]) {
                                URL.revokeObjectURL(paragraphImageUrls[para.id]);
                              }
                              updateParagraph(para.id!, { imageData: file, image: '' });
                            }
                          }}
                        />
                      </label>
                    </div>

                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteParagraph(para.id!); }}
                      className="text-luxury-text/40 hover:text-red-800 transition-colors self-end pb-1"
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
              <div className="flex justify-between items-start">
                <span className="text-xxs uppercase tracking-[0.4em] text-luxury-gold font-bold">词库管理</span>
                {isAutoSaving && (
                  <span className="text-xxs uppercase tracking-widest text-luxury-gold animate-pulse font-bold flex items-center gap-2">
                    <div className="w-1 h-1 bg-luxury-gold rounded-full" />
                    正在自动保存...
                  </span>
                )}
              </div>
              <div className="flex justify-between items-end">
                <h3 className="text-4xl font-serif">第 {paragraphs.findIndex(p => p.id === activeParaId) + 1} 段</h3>
                <button 
                  onClick={handleNewVocab}
                  className="text-xxs uppercase tracking-widest font-bold bg-[#D3CBB2] text-luxury-text px-4 py-2 hover:brightness-95 transition-all flex items-center gap-2 shadow-sm"
                >
                  <Plus size={12} />
                  新建词条
                </button>
              </div>
            </header>

            <div className="space-y-12">
              {/* 词条编辑表单 - 动态模板驱动 */}
              <VocabularyForm
                templateId={currentProject?.templateId || 'english-reading'}
                vocabulary={editingVocab}
                onChange={(field, value) => setEditingVocab(prev => ({ ...prev, [field]: value }))}
                onSave={handleSaveVocab}
                onDelete={editingVocab.id ? () => handleDeleteVocab(editingVocab.id!) : undefined}
                isAutoSaving={isAutoSaving}
              />

              {/* 已收录词汇列表 */}
              <div className="space-y-6 pt-12 border-t border-luxury-text/10">
                <div className="flex justify-between items-center">
                  <span className="text-xxs uppercase tracking-widest text-luxury-muted font-bold flex items-center gap-2">
                    <BookOpen size={12} className="text-luxury-gold" />
                    当前匹配词汇 ({paraVocab.filter(v => v.id === editingVocab.id || !v.isGlobal || matchedVocabIds.has(v.id!)).length})
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {paraVocab.filter(v => v.id === editingVocab.id || !v.isGlobal || matchedVocabIds.has(v.id!)).map(v => (
                    <div 
                      key={v.id || v.word} 
                      className={cn(
                        "p-6 border transition-all duration-500 cursor-pointer hover:shadow-md relative",
                        v.isGlobal ? "bg-luxury-paper/10 border-dashed" : "bg-luxury-bg border-solid"
                      )}
                      style={{ 
                        borderColor: v.id === editingVocab.id ? '#1A1A1A' : 'transparent',
                        borderLeftWidth: '4px',
                        borderLeftColor: v.color || '#E2B933'
                      }}
                      onClick={() => v.isGlobal ? setEditingVocab({ ...v, id: undefined }) : handleEditVocab(v)}
                    >
                      <div className="absolute top-2 right-2 flex gap-2">
                        {v.isGlobal ? (
                          <button 
                            onClick={async (e) => { 
                              e.stopPropagation(); 
                              if (activeParaId) {
                                await excludeWord(activeParaId, v.word);
                                const updated = await getVocabForParagraph(activeParaId, true);
                                setParaVocab(updated);
                                setAllVocab(prev => ({ ...prev, [activeParaId]: updated }));
                              }
                            }}
                            className="text-xxs uppercase tracking-widest bg-red-800/10 text-red-800 px-2 py-1 hover:bg-red-800 hover:text-white transition-all font-bold"
                            title="在此段落隐藏此词"
                          >
                            Hide
                          </button>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteVocab(v.id!); }}
                            className="p-2 text-luxury-text/20 hover:text-red-800 transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-serif text-xl">{v.word}</span>
                        <span className="text-xxs text-luxury-muted italic font-serif">{v.partOfSpeech}</span>
                        {v.isGlobal && (
                          <span className="text-xxs uppercase tracking-widest bg-luxury-gold/10 text-luxury-gold px-1.5 py-0.5 font-bold ml-2">Shared</span>
                        )}
                      </div>
                      <div className="text-xxs uppercase tracking-widest font-bold" style={{ color: v.color || '#E2B933' }}>{v.translation}</div>
                      {v.isGlobal && (
                        <div className="mt-2 text-xxs2 text-luxury-muted italic line-clamp-1 opacity-60">点击可复制定义到本段并编辑</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 排除列表管理 */}
                {paragraphs.find(p => p.id === activeParaId)?.excludedWords?.length ? (
                  <div className="pt-8 space-y-4">
                    <span className="text-xxs2 uppercase tracking-widest text-luxury-muted/60 font-bold">已从此段隐藏的全局词</span>
                    <div className="flex flex-wrap gap-2">
                      {paragraphs.find(p => p.id === activeParaId)?.excludedWords?.map(word => (
                        <button
                          key={word}
                          onClick={async () => {
                            if (activeParaId) {
                              await includeWord(activeParaId, word);
                              const updated = await getVocabForParagraph(activeParaId, true);
                              setParaVocab(updated);
                              setAllVocab(prev => ({ ...prev, [activeParaId]: updated }));
                            }
                          }}
                          className="text-xxs2 bg-luxury-text/5 text-luxury-muted px-2 py-1 flex items-center gap-2 hover:bg-luxury-gold/10 hover:text-luxury-gold transition-all"
                        >
                          {word} <Plus size={8} className="rotate-45" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-luxury-muted/30 space-y-8">
            <BookOpen size={64} strokeWidth={0.5} />
            <p className="text-xxs uppercase tracking-[0.3em] font-bold">请选择一个段落进行编辑</p>
          </div>
        )}
      </div>
    </div>
  );
};
