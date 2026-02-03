import React, { useState } from 'react';
import { BookOpen, History, Sparkles, Command, RefreshCw, AlertTriangle } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';

export const InstructionsPage: React.FC = () => {
  const { resetSampleData } = useProjectStore();
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleResetSamples = async () => {
    if (!confirm('确定要重置示例数据吗？\n\n这将：\n• 删除所有现有的示例项目\n• 重新加载最新的示例数据\n• 您的其他项目不会受影响')) {
      return;
    }

    setIsResetting(true);
    setResetMessage('');

    try {
      await resetSampleData();
      setResetMessage('✅ 示例数据已成功重置！');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('重置失败:', error);
      setResetMessage('❌ 重置失败，请刷新页面后重试');
    } finally {
      setTimeout(() => setIsResetting(false), 1500);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-12 md:p-20">
      <header className="mb-20 space-y-6 text-center">
        <div className="flex justify-center mb-4">
          <Command size={40} className="text-luxury-gold/40" strokeWidth={1} />
        </div>
        <span className="text-xxs uppercase tracking-[0.6em] text-luxury-gold font-bold">Manual & Version History</span>
        <h1 className="text-6xl md:text-8xl font-sans tracking-tight leading-none">使用说明 <span className="text-luxury-text/20 mx-2">&</span> 更新日志</h1>
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
              <h2 className="text-2xl font-sans font-semibold">核心工作流</h2>
            </div>

            <div className="grid grid-cols-1 gap-10">
              <div className="group space-y-3">
                <h3 className="text-xs uppercase tracking-widest font-bold flex items-center gap-3 text-luxury-text font-sans">
                  <span className="text-luxury-gold">01.</span> 内容筹备 <span className="text-xxs font-normal text-luxury-muted opacity-0 group-hover:opacity-100 transition-opacity">Curation</span>
                </h3>
                <p className="text-sm text-luxury-muted leading-relaxed pl-10 border-l border-luxury-text/5 group-hover:border-luxury-gold/30 transition-colors font-sans">
                  在编辑模式下，您可以自由拆分段落并为每个段落配置专属词库。系统支持本地图片直传，并能实时在左侧预览标注效果。
                </p>
              </div>

              <div className="group space-y-3">
                <h3 className="text-xs uppercase tracking-widest font-bold flex items-center gap-3 text-luxury-text font-sans">
                  <span className="text-luxury-gold">02.</span> 沉浸讲解 <span className="text-xxs font-normal text-luxury-muted opacity-0 group-hover:opacity-100 transition-opacity">Exhibition</span>
                </h3>
                <p className="text-sm text-luxury-muted leading-relaxed pl-10 border-l border-luxury-text/5 group-hover:border-luxury-gold/30 transition-colors font-sans">
                  进入展示模式，享受丝滑的"鱼眼"缩放交互。您可以自由切换四种预设字体（Classic/Book/Clean/Design）以匹配不同的文章调性，标点符号排版已针对放大效果深度优化。
                </p>
              </div>

              <div className="group space-y-3">
                <h3 className="text-xs uppercase tracking-widest font-bold flex items-center gap-3 text-luxury-text font-sans">
                  <span className="text-luxury-gold">03.</span> 数据安全 <span className="text-xxs font-normal text-luxury-muted opacity-0 group-hover:opacity-100 transition-opacity">Backup</span>
                </h3>
                <p className="text-sm text-luxury-muted leading-relaxed pl-10 border-l border-luxury-text/5 group-hover:border-luxury-gold/30 transition-colors font-sans">
                  利用"导入/导出"功能，您可以将课程打包为单一文件进行备份或异地传输。系统具备智能重名检测，导入时可选择覆盖或保留副本。
                </p>
              </div>
            </div>
          </section>

          <section className="bg-luxury-paper/20 p-8 border-l-2 border-luxury-gold/20 space-y-6">
            <div className="flex items-center gap-4 text-luxury-gold">
              <Sparkles size={18} strokeWidth={1.5} />
              <h2 className="text-sm uppercase tracking-widest font-bold font-sans">进阶技巧</h2>
            </div>
            <ul className="text-sm text-luxury-muted space-y-4 font-sans">
              <li className="flex gap-3">
                <span className="text-luxury-gold">✦</span>
                <span>所有数据实时自动保存，编辑词条后直接切换到展示模式即可看到最新效果。</span>
              </li>
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
              <h2 className="text-2xl font-sans font-semibold">发版历史</h2>
            </div>

            <div className="relative pl-8 space-y-12 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-luxury-text/10">
              {/* v1.1.0 */}
              <div className="relative">
                <div className="absolute -left-[35px] top-1.5 w-3 h-3 bg-luxury-gold border-2 border-luxury-bg rounded-full shadow-sm" />
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-luxury-text font-sans">v1.1.0 - 交互体验大升级</span>
                    <span className="text-xxs uppercase tracking-widest text-luxury-muted font-bold mt-1">2026.01.27</span>
                  </div>
                  <ul className="text-xs text-luxury-muted space-y-3 leading-relaxed font-sans">
                    <li className="flex gap-2">
                      <span className="text-luxury-gold">•</span>
                      <span><b>文章导入导出</b>：支持 `.json` 格式一键备份与异地读取，带冲突检测逻辑。</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-luxury-gold">•</span>
                      <span><b>个性化字体方案</b>：展示模式新增四种经典排版字体切换，适配不同审美需求。</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-luxury-gold">•</span>
                      <span><b>词组智能识别</b>：支持 Phrase 级连贯划线与整体 Fisheye 缩放。</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-luxury-gold">•</span>
                      <span><b>物理呼吸交互</b>：单词放大时自动推开邻近文字，解决文字堆叠，排布更显从容。</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-luxury-gold">•</span>
                      <span><b>五色视觉标记</b>：支持自定义重点词汇颜色，实现划线、文字、词卡的全局联动。</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-luxury-gold">•</span>
                      <span><b>编辑器增强</b>：支持词条修改实时自动保存，引入段落配图即时预览。</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-luxury-gold">•</span>
                      <span><b>视觉排版优化</b>：主页卡片去繁就简，阅读器采用对称缓冲区布局，严丝合缝。</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* v1.0.0 */}
              <div className="relative opacity-60">
                <div className="absolute -left-[35px] top-1.5 w-3 h-3 bg-luxury-text/20 border-2 border-luxury-bg rounded-full" />
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-luxury-text font-sans">v1.0.0 - 首次正式发版</span>
                    <span className="text-xxs uppercase tracking-widest text-luxury-muted font-bold mt-1">2026.01.20</span>
                  </div>
                  <ul className="text-xs text-luxury-muted space-y-3 leading-relaxed font-sans">
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

          {/* 数据管理 */}
          <section className="bg-luxury-paper/20 p-8 border-l-2 border-red-800/20 space-y-6">
            <div className="flex items-center gap-4 text-red-800">
              <AlertTriangle size={18} strokeWidth={1.5} />
              <h2 className="text-sm uppercase tracking-widest font-bold font-sans">数据管理</h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-luxury-muted font-sans">
                如果看不到示例数据，或想重新加载最新示例，可以使用下方按钮重置。
              </p>
              <p className="text-xxs text-luxury-muted/60 font-sans">
                注意：此操作只会重置示例项目，您自己创建的项目不会被删除。
              </p>

              <button
                onClick={handleResetSamples}
                disabled={isResetting}
                className="w-full md:w-auto px-6 py-3 bg-red-800/10 hover:bg-red-800 hover:text-white text-red-800 border border-red-800/30 transition-all text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={14} className={isResetting ? 'animate-spin' : ''} />
                {isResetting ? '重置中...' : '重置示例数据'}
              </button>

              {resetMessage && (
                <div className="text-xs text-center py-2 font-bold font-sans">
                  {resetMessage}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <footer className="mt-20 pt-12 border-t border-luxury-text/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xxs2 uppercase tracking-[0.4em] font-bold text-luxury-muted font-sans">
        <span>CORNER BOOK. English Reading Assistant</span>
        <span className="hidden md:block">|</span>
        <span className="text-luxury-gold/60">Designed for Educational Excellence</span>
        <span className="hidden md:block">|</span>
        <span>© 2026 All Rights Reserved</span>
      </footer>
    </div>
  );
};
