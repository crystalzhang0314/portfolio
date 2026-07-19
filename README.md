# Crystal Portfolio Replica

这是从本机 `http://localhost:8080/` 独立复刻的纯前端项目，不会读取或修改原项目源码。

## 本地运行

```bash
npm install
npm run dev -- --port 8081
```

默认建议使用 8081 端口，避免与原项目的 8080 端口冲突。

## 说明

- `index.html`、`assets/index.js`、`assets/index.css` 是浏览器实际加载内容的完整本地镜像。
- 项目可独立运行，暗/亮主题、导航、项目详情和页面动效均保留。
- 后续 vibe coding 可以直接从 CSS 视觉变量与页面组件逻辑开始修改。
