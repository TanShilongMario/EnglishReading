import React, { useState, useEffect } from 'react';
import { db, Project, Vocabulary, Paragraph } from '../../api/db';
import { BookOpen, Search, ArrowUpRight, Trash2, ChevronRight, Edit, Quote, Book } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SentenceService, SentenceMatch } from '../../services/SentenceService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VocabularyBookProps {
  onNavigateToArticle: (projectId: number, paragraphId: number, vocabId?: number) => void;
  onNavigateToEdit: (projectId: number, paragraphId: number, vocabId: number) => void;
}

const VocabBookEntry: React.FC<{ 
  vocab: Vocabulary; 
  onNavigate: (projectId: number, paraId: number, vocabId?: number) => void;
  onEdit: (projectId: number, paraId: number, vocabId: number) => void;
  onDelete: (id: number) => void;
}> = ({ vocab, onNavigate, onEdit, onDelete }) => {
  const [allOccurrences, setAllOccurrences] = useState<SentenceMatch[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    setIsScanning(true);
    // 扫描全库中该单词的所有出现位置
    SentenceService.searchContextualSentences(vocab.word, vocab.matchPattern)
      .then(results => {
        setAllOccurrences(results);
        setIsScanning(false);
      });
  }, [vocab.word, vocab.matchPattern]);

  const renderHighlightedText = (text: string) => {
    if (!vocab.word) return text;
    const patterns = [vocab.word, ...(vocab.matchPattern?.split(/[,，]/).map(p => p.trim()) || [])]
      .filter(Boolean)
      .map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`\\b(${patterns.join('|')})\\b`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) => {
          const isMatch = patterns.some(p => new RegExp(`^${p}$`, 'i').test(part));
          return isMatch ? (
            <span key={i} className="font-bold underline decoration-2 underline-offset-4" style={{ color: vocab.color || '#E2B933', textDecorationColor: `${vocab.color || '#E2B933'}4D` }}>
              {part}
            </span>
          ) : part;
        })}
      </>
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group border border-luxury-text/10 bg-luxury-bg transition-all duration-700 relative flex flex-col"
      style={{ 
        borderColor: vocab.color ? `${vocab.color}20` : undefined,
        borderLeftWidth: '4px',
        borderLeftColor: vocab.color || '#E2B933'
      }}
    >
      {/* 顶部标题与操作 */}
      <div className="p-8 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <h3 className="text-3xl font-serif leading-none" style={{ color: vocab.color || '#E2B933' }}>{vocab.word}</h3>
            <div className="flex items-center gap-3 text-sm font-serif italic text-luxury-muted">
              <span>{vocab.partOfSpeech}</span>
              <p>{vocab.phonetic}</p>
            </div>
          </div>
          
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(0, vocab.paragraphId, vocab.id!)} // 这里的 projectId 在 App.tsx 中会被重新 load
              className="p-2 text-luxury-muted hover:text-luxury-text transition-colors"
              style={{ color: vocab.color || '#E2B933' }}
              title="编辑词条"
            >
              <Edit size={16} />
            </button>
            <button 
              onClick={() => onDelete(vocab.id!)}
              className="p-2 text-luxury-muted/20 hover:text-red-800 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-base font-bold" style={{ color: vocab.color || '#E2B933' }}>{vocab.translation}</p>
          <p className="text-base text-luxury-muted italic leading-relaxed">{vocab.definition}</p>
        </div>
      </div>

      {/* 例句展示区 */}
      <div className="px-8 pb-8 space-y-6 flex-1">
        {/* 用户输入例句 */}
        {((vocab.examples && vocab.examples.length > 0) || (vocab.contextualExamples && vocab.contextualExamples.length > 0)) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-luxury-muted/40">
              <Quote size={11} /> 录入例句
            </div>
            {vocab.examples?.map((ex, i) => (
              <p key={`ex-${i}`} className="text-sm font-serif italic text-luxury-text/70 pl-4 border-l border-luxury-text/5">
                {renderHighlightedText(ex)}
              </p>
            ))}
            {vocab.contextualExamples?.map((ex, i) => (
              <div key={`ctx-${i}`} className="space-y-1 pl-4 border-l border-luxury-gold/20">
                <p className="text-sm font-serif italic text-luxury-text/70">
                  {renderHighlightedText(ex.text)}
                </p>
                <p className="text-[9px] uppercase tracking-tighter font-bold text-luxury-gold/40">
                  — FROM 《{ex.sourceTitle}》
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 全库自动索引的语境句子 */}
        {allOccurrences.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-luxury-text/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-luxury-gold/60">
                <Book size={11} /> 语境跳转
              </div>
              {isScanning && <span className="text-[9px] text-luxury-gold/40 animate-pulse italic">Scanning...</span>}
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {allOccurrences.map((occ, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate(occ.projectId, occ.paragraphId, vocab.id)}
                  className="w-full text-left p-3 bg-luxury-text/5 hover:bg-luxury-gold/5 border border-transparent hover:border-luxury-gold/20 transition-all group/occ"
                >
                  <p className="text-sm font-serif leading-relaxed text-luxury-muted group-hover/occ:text-luxury-text transition-colors">
                    {renderHighlightedText(occ.text)}
                  </p>
                  <p className="mt-2 text-[9px] uppercase tracking-tighter font-bold text-luxury-gold/40">
                    — 《{occ.sourceTitle}》
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const VocabularyBook: React.FC<VocabularyBookProps> = ({ onNavigateToArticle, onNavigateToEdit }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [vocabList, setVocabList] = useState<Vocabulary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 加载所有有词汇的项目
  useEffect(() => {
    const fetchProjects = async () => {
      const allProjects = await db.projects.toArray();
      setProjects(allProjects);
      if (allProjects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(allProjects[0].id!);
      }
    };
    fetchProjects();
  }, []);

  // 加载选中项目的词汇
  useEffect(() => {
    if (selectedProjectId) {
      const fetchVocab = async () => {
        const paragraphs = await db.paragraphs.where('projectId').equals(selectedProjectId).toArray();
        const paraIds = paragraphs.map(p => p.id!);
        const vocabs = await db.vocabulary.where('paragraphId').anyOf(paraIds).toArray();
        setVocabList(vocabs);
      };
      fetchVocab();
    }
  }, [selectedProjectId]);

  const filteredVocab = vocabList.filter(v => 
    v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.translation?.includes(searchQuery) ||
    v.definition?.includes(searchQuery)
  );

  const handleDeleteVocab = async (id: number) => {
    if (confirm('确定要从单词本中移除这个词吗？')) {
      await db.vocabulary.delete(id);
      setVocabList(prev => prev.filter(v => v.id !== id));
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-luxury-bg overflow-hidden relative z-10 font-serif">
      {/* 左侧：课程/文章导航 */}
      <div className="w-1/4 border-r border-luxury-text/10 p-12 overflow-y-auto custom-scrollbar">
        <header className="mb-12 space-y-4">
          <span className="text-xxs uppercase tracking-[0.4em] text-luxury-gold font-bold">Archives</span>
          <h2 className="text-4xl font-serif">课程索引</h2>
        </header>

        <div className="space-y-4">
          {projects.map(project => (
            <button
              key={project.id}
              onClick={() => setSelectedProjectId(project.id!)}
              className={`w-full text-left p-6 transition-all duration-500 border-l-2 ${
                selectedProjectId === project.id 
                  ? 'bg-luxury-paper/20 border-luxury-gold text-luxury-text' 
                  : 'border-transparent text-luxury-muted hover:bg-luxury-paper/10'
              }`}
            >
              <div className="text-xxs2 uppercase tracking-widest opacity-50 mb-1">
                {new Date(project.createdAt).toLocaleDateString()}
              </div>
              <div className="text-lg leading-tight line-clamp-2">{project.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 右侧：词汇列表 */}
      <div className="flex-1 flex flex-col p-16 overflow-hidden">
        <header className="flex justify-between items-end mb-16">
          <div className="space-y-4">
            <span className="text-xxs uppercase tracking-[0.4em] text-luxury-gold font-bold">Lexicon</span>
            <h2 className="text-6xl font-serif">单词本</h2>
          </div>

          <div className="relative w-80">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-luxury-muted" size={16} />
            <input 
              type="text"
              placeholder="搜索单词或释义..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-b border-luxury-text/20 focus:border-luxury-gold outline-none pl-8 py-2 text-sm transition-colors"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
          {filteredVocab.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredVocab.map((vocab) => (
                  <VocabBookEntry
                    key={vocab.id}
                    vocab={vocab}
                    onNavigate={onNavigateToArticle}
                    onEdit={onNavigateToEdit}
                    onDelete={handleDeleteVocab}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-luxury-muted/30 space-y-8">
              <BookOpen size={80} strokeWidth={0.5} />
              <p className="text-xs uppercase tracking-[0.4em] font-bold">No vocabulary found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
