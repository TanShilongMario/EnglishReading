# 字体设计规范

## 字号层级系统

### 页面级
- **text-8xl** (96px): 首页主标题 "Your Reading Inventory"
- **text-7xl** (72px): 模态框主标题
- **text-6xl** (60px): 区块主标题（单词本标题、说明页标题）

### 区块级
- **text-5xl** (48px): 模板选择标题
- **text-4xl** (40px): 编辑器文章标题、课程索引标题、段落标题

### 组件级
- **text-3xl** (30px): 单词卡片词条
- **text-2xl** (24px): 段落编号、小节标题
- **text-xl** (20px): 作者输入、编辑器正文

### 内容级
- **text-lg** (18px): 导航栏、模板描述
- **text-base** (16px): 默认正文、输入框文本
- **text-sm** (14px): 辅助说明、次要信息

### 标签/按钮级
- **text-xs** (12px): 标签、按钮文本、日期
- **text-xxs** (10px): 极小提示文本（替代 `text-[10px]`）
- **text-xxs2** (9px): 最小文本（替代 `text-[9px]`）

## 字体家族

### 衬线字体（用于标题、正文、阅读内容）
- **font-serif**: Georgia + 中文字体（默认衬线）
- **font-serif-classic**: Georgia, STSong, Songti SC, SimSun
- **font-serif-modern**: Times New Roman, Times, STZhongsong

### 无衬线字体（用于 UI 元素、导航、按钮）
- **font-sans**: Inter + 中文字体（默认无衬线）
- **font-sans-modern**: Inter, PingFang SC, Microsoft YaHei
- **font-sans-elegant**: 系统原生字体栈

### 字体使用场景
- **标题**: font-serif（优雅、经典）
- **正文/阅读**: font-serif（易读、舒适）
- **UI 元素**: font-sans（现代、清晰）
- **导航/按钮**: font-sans（简洁、功能性强）

## 字重
- **font-normal** (400): 默认文本
- **font-bold** (700): 标题、按钮、标签
- **font-semibold** (500): 次级标题
- **font-light** (300): 装饰性文本

## 字间距
- **tracking-tighter**: 大标题紧凑效果
- **tracking-tight**: 常规标题
- **tracking-button**: 按钮文本 (0.2em)
- **tracking-widest**: 标签 (0.4em)
- **tracking-editorial**: 编辑风格 (0.25em)
- **tracking-widest-plus**: 特宽间距 (0.5em)

## 行高
- **leading-none**: 大标题
- **leading-tight**: 标题 (1.25)
- **leading-snug**: 副标题 (1.375)
- **leading-normal**: 默认 (1.5)
- **leading-relaxed**: 正文、描述 (1.625)
- **leading-loose**: 宽松排版 (2)

## 样式转换
| 原样式 | 新样式 | 说明 |
|--------|--------|------|
| `text-[9px]` | `text-xxs2` | 9px |
| `text-[10px]` | `text-xxs` | 10px |
| `font-serif-classic` | `font-serif` | 使用 Tailwind 默认 |
| `text-base` | `text-base` | 保持不变 |
| `text-lg` | `text-lg` | 保持不变 |

## 最佳实践

1. **避免硬编码字号**: 使用 Tailwind 预定义的字号类，而不是 `text-[XXpx]`
2. **保持一致性**: 相同层级的内容使用相同的字号
3. **使用语义化**: 选择字号时考虑内容层级，而非视觉大小
4. **响应式考虑**: 在移动端适当减小字号（使用 `md:` 前缀）
5. **可读性优先**: 正文内容不小于 text-base (16px)
