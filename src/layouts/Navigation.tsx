import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavigationProps {
  currentProject: any;
}

export const Navigation: React.FC<NavigationProps> = ({ currentProject }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-luxury-bg/80 backdrop-blur-md border-b border-luxury-text/10 flex items-center justify-between px-16 z-[60]">
      <Link
        to="/"
        className="flex items-center gap-4 cursor-pointer group"
      >
        <span className="font-serif italic text-lg tracking-tighter">CORNER BOOK.</span>
        <div className="h-4 w-px bg-luxury-text/20" />
        <span className="text-xxs uppercase tracking-editorial font-bold text-luxury-muted">English Reading / Vol.01</span>
      </Link>

      <div className="flex gap-4 font-serif">
        <Link
          to="/"
          className={`px-5 py-2 text-xs uppercase tracking-button font-bold transition-all duration-500 hover:bg-luxury-text/5 ${isActive('/') ? 'text-luxury-gold' : 'text-luxury-text/60 hover:text-luxury-text'}`}
        >
          课程库
        </Link>
        <Link
          to="/vocabulary"
          className={`px-5 py-2 text-xs uppercase tracking-button font-bold transition-all duration-500 hover:bg-luxury-text/5 ${isActive('/vocabulary') ? 'text-luxury-gold' : 'text-luxury-text/60 hover:text-luxury-text'}`}
        >
          单词本
        </Link>
        <Link
          to="/present"
          className={`px-5 py-2 text-xs uppercase tracking-button font-bold transition-all duration-500 hover:bg-luxury-text/5 ${!currentProject ? 'opacity-20 pointer-events-none' : isActive('/present') ? 'text-luxury-gold' : 'text-luxury-text/60 hover:text-luxury-text'}`}
        >
          展示模式
        </Link>
        <Link
          to="/edit"
          className={`px-5 py-2 text-xs uppercase tracking-button font-bold transition-all duration-500 hover:bg-luxury-text/5 ${!currentProject ? 'opacity-20 pointer-events-none' : isActive('/edit') ? 'text-luxury-gold' : 'text-luxury-text/60 hover:text-luxury-text'}`}
        >
          内容编辑
        </Link>
        <div className="w-px h-4 bg-luxury-text/10 self-center mx-2" />
        <Link
          to="/instructions"
          className={`px-5 py-2 text-xs uppercase tracking-button font-bold transition-all duration-500 hover:bg-luxury-text/5 ${isActive('/instructions') ? 'text-luxury-gold' : 'text-luxury-text/60 hover:text-luxury-text'}`}
        >
          使用说明
        </Link>
      </div>
    </nav>
  );
};
