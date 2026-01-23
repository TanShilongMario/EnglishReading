# CORNER BOOK - 英语精读教学辅助工具

CORNER BOOK 是一款专为英语老师设计的课堂精读教学辅助工具。它通过优雅的视觉设计和交互体验，帮助老师在课堂上更生动地展示文章、讲解词汇。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 核心特性

- **高级感设计**：采用 Luxury / Editorial 设计风格，米色背景，衬线字体，营造沉浸式阅读氛围。
- **鱼眼放大特效**：鼠标悬停单词时产生动态缩放效果，聚焦教学重点，提升课堂注意力。
- **智能词卡系统**：点击重点词汇即刻弹出精美词卡，支持音标、词性、中英双解及例句关键词高亮。
- **本地化存储**：基于 IndexedDB (Dexie.js)，所有数据存储在浏览器本地，无需服务器，保护隐私。
- **单词本功能**：自动汇总所有课程词汇，支持按课程筛选和快速索引回原文。
- **响应式编辑**：左侧编辑段落，右侧配置词汇，支持本地图片上传，实时预览高亮效果。

## 快速开始

### 环境要求
- Node.js 18.x 或更高版本
- 现代浏览器（Chrome, Edge, Safari）

### 安装步骤
1. 克隆仓库
```bash
git clone https://github.com/your-username/corner-book.git
cd corner-book
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

## 使用指南

1. **管理课程**：在首页点击 `+ New Entry` 创建新文章。
2. **编辑内容**：
   - 在左侧输入或粘贴段落文字。
   - 点击段落激活，在右侧添加该段落的重点词汇。
   - 设置“匹配模式”（如单词的变形）以确保在原文中正确高亮。
3. **展示讲解**：
   - 点击 `Enter Exhibition` 进入展示模式。
   - 使用底部导航切换段落。
   - 鼠标悬停单词体验放大效果，点击高亮单词弹出词卡。
4. **单词复习**：点击顶栏 `单词本` 查看所有已保存词汇。

## 技术栈

- **框架**: React 18 + Vite
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **数据库**: Dexie.js (IndexedDB)
- **状态管理**: Zustand
- **图标**: Lucide React

## 开源协议

本项目采用 [MIT License](LICENSE) 协议。

---

### 更新日志
#### v1.0.0 - 首次正式发版
- 核心架构搭建完成
- 实现鱼眼放大与智能词卡
- 支持本地数据持久化与单词本功能
- 内置《How to Articulate Yourself Intelligently》示例课程
