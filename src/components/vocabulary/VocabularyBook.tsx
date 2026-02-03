import React, { useState, useEffect } from 'react';
import { db, Project, Vocabulary, Paragraph } from '../../api/db';
import { BookOpen, Search, ArrowUpRight, Trash2, ChevronRight, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VocabularyBookProps {
  onNavigateToArticle: (projectId: number, paragraphId: number, vocabId?: number) => void;
  onNavigateToEdit: (projectId: number, paragraphId: number, vocabId: number) => void;
}

export const VocabularyBook: React.FC<VocabularyBookProps> = ({ onNavigateToArticle, onNavigateToEdit }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [vocabList, setVocabList] = useState<Vocabulary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 加载所有有词汇的项目
  useEffect(() => {
    const fetchProjects = async () => {
      const allProjects = await db.projects.toArray();
      // 过滤出真正有词汇的项目（可选，这里先显示全部）
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
    v.translation.includes(searchQuery)
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
                  <motion.div
                    key={vocab.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group border border-luxury-text/10 p-8 bg-luxury-bg transition-all duration-700 relative"
                    style={{ 
                      borderColor: vocab.color ? `${vocab.color}20` : undefined,
                      borderLeftWidth: '4px',
                      borderLeftColor: vocab.color || '#E2B933'
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <h3 className="text-3xl font-serif leading-none" style={{ color: vocab.color || '#E2B933' }}>{vocab.word}</h3>
                        <div className="flex items-center gap-3 text-sm font-serif italic">
                          <span className="text-luxury-muted/60">{vocab.partOfSpeech}</span>
                          <p style={{ color: vocab.color || '#E2B933' }}>{vocab.phonetic}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onNavigateToEdit(selectedProjectId!, vocab.paragraphId, vocab.id!)}
                          className="p-2 text-luxury-muted hover:text-luxury-text transition-colors"
                          style={{ color: vocab.color || '#E2B933' }}
                          title="编辑词条"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => onNavigateToArticle(selectedProjectId!, vocab.paragraphId, vocab.id)}
                          className="p-2 text-luxury-muted hover:opacity-70 transition-colors"
                          style={{ color: vocab.color || '#E2B933' }}
                          title="快速索引至文章"
                        >
                          <ArrowUpRight size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteVocab(vocab.id!)}
                          className="p-2 text-luxury-muted hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm font-bold" style={{ color: vocab.color || '#E2B933' }}>{vocab.translation}</p>
                      <p className="text-sm text-luxury-muted italic line-clamp-2">{vocab.definition}</p>
                    </div>

                    {/* 快速索引装饰 */}
                    <div 
                      className="absolute bottom-4 right-4 flex items-center gap-2 text-xxs2 uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 cursor-pointer transition-all translate-x-4 group-hover:translate-x-0"
                      style={{ color: vocab.color || '#E2B933' }}
                      onClick={() => onNavigateToArticle(selectedProjectId!, vocab.paragraphId, vocab.id)}
                    >
                      Quick Index <ChevronRight size={10} />
                    </div>
                  </motion.div>
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
