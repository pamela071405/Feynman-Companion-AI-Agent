# 费曼伴学 · 智能体（前端 MVP）

基于 Vue3 + Vite + Pinia 的单屏沉浸式对话窗口。

## 启动

```bash
npm install
npm run dev
```

默认监听 http://localhost:5173

## 切换 Mock / 真实接口

修改 `.env.development`：

```ini
VITE_USE_MOCK=true   # 走本地 mock（首期默认）
VITE_USE_MOCK=false  # 调真实后端 /api/v1/feynman/chat
```

`vite.config.js` 中已配置 `/api` 代理到 `http://127.0.0.1:8000`，后端联调时改这里即可。

## 目录结构

```
src/
├── api/                # 接口层 + Mock 数据
│   ├── feynman.js
│   └── mockData.js
├── components/         # 5 个核心组件
│   ├── ChatInput.vue
│   ├── LoadingBubble.vue
│   ├── MessageBubble.vue
│   ├── RadarChart.vue
│   ├── ReportCard.vue
│   └── ReportDrawer.vue
├── stores/
│   └── chatStore.js    # Pinia 状态机
├── styles/
│   └── global.css
├── views/
│   └── ChatView.vue    # 单屏主页面
├── App.vue
└── main.js
```

## Mock 行为

- 首屏：自动下发引导问题
- 用户第 1、2 次发送：返回追问
- 用户第 3 次发送：返回 `generate_report`，触发卡片 + 抽屉
- 真实后端：完全按契约返回，前端不感知轮次

## 后续 TODO

- [ ] 接入真实后端（关掉 `VITE_USE_MOCK`）
- [ ] ECharts 雷达图样式微调
- [ ] 移动端细调
- [ ] Markdown 渲染（AI 气泡 / deep_analysis 字段）
