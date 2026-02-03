import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navigation } from './layouts/Navigation';
import { HomePage } from './pages/HomePage';
import { PresentPage } from './pages/PresentPage';
import { EditPage } from './pages/EditPage';
import { VocabPage } from './pages/VocabPage';
import { InstructionsPage } from './pages/InstructionsPage';
import { useProjectStore } from './store/useProjectStore';
import { db, migrateDatabase } from './api/db';

function App() {
  const [isMigrating, setIsMigrating] = useState(true);
  const { currentProject, initializeSampleData } = useProjectStore();
  const location = useLocation();

  // 数据库迁移（优先级最高）
  useEffect(() => {
    migrateDatabase().then(() => setIsMigrating(false));
  }, []);

  // 初始化示例数据
  useEffect(() => {
    initializeSampleData();
  }, [initializeSampleData]);

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

      <Navigation currentProject={currentProject} />

      {/* 主内容区 */}
      <main className="pt-20 min-h-screen relative z-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/present" element={<PresentPage />} />
          <Route path="/edit" element={<EditPage />} />
          <Route path="/vocabulary" element={<VocabPage />} />
          <Route path="/instructions" element={<InstructionsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
