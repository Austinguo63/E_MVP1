# AI Flow Editor

一个基于 Next.js 的 AI 辅助文档编辑器，支持流式生成和交互式编辑。

## 功能特点

### 流式生成
- AI 按章节逐步填充内容
- 用户可随时暂停和继续生成
- 自动插入数据和参考来源

### 交互式编辑
- 用户可以随时修改 AI 生成的内容
- 选中文本可触发 AI 优化建议
- AI 可根据用户反馈重新生成特定部分

## 技术栈

- **前端**: Next.js, React
- **部署**: Vercel
- **AI 集成**: 模拟 API (实际项目中可集成 OpenAI API)

## 开发指南

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

## 部署到 Vercel

该项目已配置为可直接部署到 Vercel 平台。只需将代码推送到 GitHub 仓库，然后在 Vercel 中导入该仓库即可。

## 项目结构

- `/pages`: Next.js 页面组件和 API 路由
- `/components`: React 组件
- `/styles`: CSS 样式文件
- `/public`: 静态资源

## 后续开发计划

- 集成真实的 AI API
- 添加更多文档模板
- 实现协作编辑功能
- 增强数据可视化能力
