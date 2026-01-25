import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Edit3, Presentation, ListMusic, History, Sparkles, Command } from 'lucide-react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-lg"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-[#F9F8F6] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-luxury-text/10 overflow-hidden flex flex-col font-serif z-10"
          >
            {/* 顶部装饰条 */}
            <div className="h-1.5 w-full bg-luxury-gold" />

            <button 
              onClick={onClose}
              className="absolute top-10 right-10 p-2 text-luxury-text/40 hover:text-luxury-gold transition-colors z-10 group"
            >
              <X size={20} strokeWidth={1.5} className="group-hover:rotate-90 transition-transform duration-500" />
            </button>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-12 md:p-20">
                <header className="mb-20 space-y-6 text-center">
                  <div className="flex justify-center mb-4">
                    <Command size={32} className="text-luxury-gold/40" strokeWidth={1} />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.6em] text-luxury-gold font-bold">Manual & Version History</span>
                  <h2 className="text-5xl md:text-7xl font-serif tracking-tighter italic leading-none">使用说明 <span className="not-italic text-luxury-text/20 mx-2">&</span> 更新日志</h2>
                  <div className="h-px w-24 bg-luxury-gold/30 mx-auto mt-8" />
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-24">
                  {/* 左侧：使用说明 (占 3 列) */}
                  <div className="lg:col-span-3 space-y-16">
                    <section className="space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="bg-luxury-gold/10 p-2 text-luxury-gold">
                          <BookOpen size={18} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-serif italic">核心工作流</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-10">
                        <div className="group space-y-3">
                          <h4 className="text-xs uppercase tracking-widest font-bold flex items-center gap-3 text-luxury-text">
                            <span className="text-luxury-gold">01.</span> 内容筹备 <span className="text-[10px] font-normal text-luxury-muted opacity-0 group-hover:opacity-100 transition-opacity">Curation</span>
                          </h4>
                          <p className="text-sm text-luxury-muted leading-relaxed pl-10 border-l border-luxury-text/5 group-hover:border-luxury-gold/30 transition-colors">
                            在编辑模式下，您可以自由拆分段落并为每个段落配置专属词库。系统支持本地图片直传，并能实时在左侧预览标注效果。
                          </p>
                        </div>

                        <div className="group space-y-3">
                          <h4 className="text-xs uppercase tracking-widest font-bold flex items-center gap-3 text-luxury-text">
                            <span className="text-luxury-gold">02.</span> 沉浸讲解 <span className="text-[10px] font-normal text-luxury-muted opacity-0 group-hover:opacity-100 transition-opacity">Exhibition</span>
                          </h4>
                          <p className="text-sm text-luxury-muted leading-relaxed pl-10 border-l border-luxury-text/5 group-hover:border-luxury-gold/30 transition-colors">
                            进入展示模式，享受丝滑的“鱼眼”缩放交互。点击带标记的单词即可唤起精美的释义卡片，标点符号排版已针对放大效果深度优化。
                          </p>
                        </div>

                        <div className="group space-y-3">
                          <h4 className="text-xs uppercase tracking-widest font-bold flex items-center gap-3 text-luxury-text">
                            <span className="text-luxury-gold">03.</span> 知识沉淀 <span className="text-[10px] font-normal text-luxury-muted opacity-0 group-hover:opacity-100 transition-opacity">Lexicon</span>
                          </h4>
                          <p className="text-sm text-luxury-muted leading-relaxed pl-10 border-l border-luxury-text/5 group-hover:border-luxury-gold/30 transition-colors">
                            通过单词本全局检索所有课程的重点词汇。利用“Quick Index”功能，您可以从单词本一键跳转回文章的上下文语境。
                          </p>
                        </div>
                      </div>
                    </section>

                    <section className="bg-luxury-paper/20 p-8 border-l-2 border-luxury-gold/20 space-y-6">
                      <div className="flex items-center gap-4 text-luxury-gold">
                        <Sparkles size={18} strokeWidth={1.5} />
                        <h3 className="text-sm uppercase tracking-widest font-bold">进阶技巧</h3>
                      </div>
                      <ul className="text-sm text-luxury-muted space-y-4">
                        <li className="flex gap-3">
                          <span className="text-luxury-gold">✦</span>
                          <span>利用匹配模式（Match Variations）关联单词的复数、过去式等变形。</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-luxury-gold">✦</span>
                          <span>所有数据均存储于浏览器 IndexedDB，刷新页面或离线使用依然稳健。</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-luxury-gold">✦</span>
                          <span>点击顶栏 logo 随时回到课程总览页面。</span>
                        </li>
                      </ul>
                    </section>
                  </div>

                  {/* 右侧：更新日志 (占 2 列) */}
                  <div className="lg:col-span-2 space-y-12">
                    <section className="space-y-10">
                      <div className="flex items-center gap-4">
                        <div className="bg-luxury-text text-luxury-bg p-2">
                          <History size={18} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-serif italic">发版历史</h3>
                      </div>

                      <div className="relative pl-8 space-y-12 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-luxury-text/10">
                        {/* v1.1.0 */}
                        <div className="relative">
                          <div className="absolute -left-[35px] top-1.5 w-3 h-3 bg-luxury-gold border-2 border-luxury-bg rounded-full shadow-sm" />
                          <div className="space-y-4">
                            <div className="flex flex-col">
                              <span className="text-xl font-bold text-luxury-text">v1.1.0 - 交互体验大升级</span>
                              <span className="text-[10px] uppercase tracking-widest text-luxury-muted font-bold mt-1">2026.01.23</span>
                            </div>
                            <ul className="text-xs text-luxury-muted space-y-3 leading-relaxed">
                              <li className="flex gap-2">
                                <span className="text-luxury-gold">•</span>
                                <span><b>词组智能识别</b>：支持 Phrase 级连贯划线与整体 Fisheye 缩放。</span>
                              </li>
                              <li className="flex gap-2">
                                <span className="text-luxury-gold">•</span>
                                <span><b>物理呼吸交互</b>：单词放大时自动推开邻近文字，排版稳如磐石。</span>
                              </li>
                              <li className="flex gap-2">
                                <span className="text-luxury-gold">•</span>
                                <span><b>五色视觉标记</b>：支持自定义重点词汇颜色，全链路视觉联动。</span>
                              </li>
                              <li className="flex gap-2">
                                <span className="text-luxury-gold">•</span>
                                <span><b>编辑器增强</b>：引入段落配图即时预览，支持多例句实时管理。</span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        {/* v1.0.0 */}
                        <div className="relative opacity-60">
                          <div className="absolute -left-[35px] top-1.5 w-3 h-3 bg-luxury-text/20 border-2 border-luxury-bg rounded-full" />
                          <div className="space-y-4">
                            <div className="flex flex-col">
                              <span className="text-xl font-bold text-luxury-text">v1.0.0 - 首次正式发版</span>
                              <span className="text-[10px] uppercase tracking-widest text-luxury-muted font-bold mt-1">2026.01.20</span>
                            </div>
                            <ul className="text-xs text-luxury-muted space-y-3 leading-relaxed">
                              <li className="flex gap-2">
                                <span className="text-luxury-gold">•</span>
                                <span><b>奢华社刊设计</b>：全系统衬线体排版与暖米白 UI。</span>
                              </li>
                              <li className="flex gap-2">
                                <span className="text-luxury-gold">•</span>
                                <span><b>智能阅读引擎</b>：支持鱼眼缩放交互与词卡展示。</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>

            <footer className="bg-luxury-text text-luxury-bg/40 py-8 px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] uppercase tracking-[0.4em] font-bold">
              <span>CORNER BOOK. English Reading Assistant</span>
              <span className="text-luxury-bg/20 hidden md:block">|</span>
              <span className="text-luxury-gold/60">Designed for Educational Excellence</span>
              <span className="text-luxury-bg/20 hidden md:block">|</span>
              <span>© 2026 All Rights Reserved</span>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
