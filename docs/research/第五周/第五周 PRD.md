# 费曼伴学智能体 第五周 PRD（V1.0）

版本：V1.0

日期：2026-07-20

周期：第五周

范围：轻量化单教材 RAG 向量检索 + 用户账号登录注册与会话持久化

团队：2 后端（马茗燕、陈艺博）+ 1 前端（许嘉琪）

前置基线：第四周已完成教材 PDF 解析管线、知识点四维 rubric 生成、LangGraph 费曼追问流程、四级级联选择、对话 & 报告页面全链路

## 一、产品概述与本周目标

### 1.1 本周核心目标

基于第四周完整费曼学习链路，新增两大独立核心模块，实现产品可用闭环：

1. 轻量化 RAG 语义检索模块

   

   现有机制仅依靠页码区间精准拉取知识点原文，无法召回跨章节、语义相关教材段落；新增 Chunk 向量化存储、单教材语义检索，在 LangGraph 评判节点补充全书相关原文，解决跨章节上下文缺失、LLM 评判幻觉问题。

   - 仅支持**单本教材内检索**，跨教材检索归入 V2；
   - 不替换原有页码取 Chunk 逻辑，RAG 原文作为补充文本注入 Prompt。

2. 用户账号体系（注册 / 登录 / 鉴权 / 数据隔离）

   

   第四周 Session 仅内存存储、无用户隔离，关闭页面丢失全部数据；新增用户表、全业务表增加 user_id 隔离、会话持久化落库、登录鉴权拦截、个人资源管理。

   - 仅账号密码登录，第三方登录 / 短信验证码归入 V1.5；
   - 保留游客模式，未登录用户可完整使用第四周全部功能，数据归属默认 guest 用户。

### 1.2 本周非目标（不开发，顺延后续迭代）

1. RAG 相关：跨教材检索、向量重排、Embedding 微调、云端向量库、向量备份、独立全文问答页面；
2. 账号相关：密码找回、头像、会员 / 付费、多端同步、权限分组、短信 / 微信登录；
3. 原有业务优化：rubric 生成增强、学情数据看板、SRS 复习；
4. 复杂配套：教材批量导入、PDF 扫描件 OCR、知识点关联图谱。

### 1.3 成功指标

|                   指标                    |      目标值      |
| :---------------------------------------: | :--------------: |
|     教材解析完成后 Chunk 向量化成功率     |       ≥95%       |
|     RAG 语义检索召回有效相关片段占比      | ≥70%（人工验收） |
|         登录 / 注册接口请求成功率         |       ≥98%       |
| 全接口鉴权逻辑无阻塞，游客 / 登录态双兼容 |       100%       |
|     LangGraph 接入 RAG 后全流程无报错     |       100%       |
| 用户数据隔离：登录用户仅可见自身上传教材  |       100%       |
|    历史会话持久化：刷新页面对话不丢失     |       100%       |

## 二、团队分工

|                    角色                     |                           负责模块                           |                        一周完整交付物                        |
| :-----------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: |
|    马茗燕（教材管线 / RAG / 数据层改造）    | 1. 全表新增 user_id 字段、SQLite 兼容逻辑；2. 向量库（Chroma）封装、Chunk 异步 Embedding 任务；3. RAG 检索接口；4. 用户表 DDL、教材 / 知识点数据用户隔离查询改造 | 1. 向量库工具类；2. 新增用户、RAG 全套后端 A 接口；3. 全数据表结构升级脚本；4. RAG Mock 数据集 |
| 陈艺博（LangGraph / 账号鉴权 / 会话持久化） | 1. 用户登录注册、Token 鉴权中间件；2. Session 从内存迁移至 SQL 持久化；3. LangGraph 新增 retrieve 检索节点，RAG 文本注入 evaluate Prompt；4. 会话绑定 user_id；5. 后端 B 接口增加鉴权拦截 | 1. 鉴权中间件；2. 账号相关接口；3. 改造后 LangGraph 节点流程图；4. 会话持久化存储逻辑；5. 账号模块 Mock 数据 |
|               许嘉琪（前端）                | 1. 登录 / 注册独立页面；2. 全局路由鉴权拦截；3. 顶部用户信息栏、退出登录；4. 个人中心（我的教材、历史对话、历史报告 P1）；5. 所有页面增加用户数据过滤逻辑；6. RAG 检索前端配套（知识点详情关联原文 P1） | 1. 2 个新页面（登录 / 注册）；2. 现有页面鉴权 & 数据隔离改造；3. 个人中心页面（P1）；4. 全局请求拦截器携带 token |

## 三、功能点清单

### 3.1 后端 A：用户数据层改造 + RAG 向量检索管线

#### P0 必做功能

1. 用户数据表维护

   - 用户注册：创建 user 记录，生成唯一 user_id，密码加密存储
   - 用户登录：校验账号密码，生成时效 Token 返回前端
   - 全局鉴权：接口统一校验 Header Token，区分游客 / 登录用户

2. 全业务表 user_id 隔离改造

   Material/Chapter/Chunk/KP 新增 user_id 字段，游客默认绑定 guest 用户；新增资源查询接口自动过滤当前用户数据

3. Chunk 向量化异步管线

   PDF 解析全部完成后，异步遍历该教材所有 Chunk，调用 Embedding 模型生成向量存入 Chroma 向量库；删除教材同步删除对应向量数据

4. 单教材语义检索接口

   根据用户输入文本生成向量，限定 material_id 范围，召回 Top3 相似度最高 Chunk

5. 存量数据兼容逻辑

   第四周无 user_id 历史数据统一归属 guest 用户，不强制迁移

#### P1 次要功能（本周有余量再开发）

1. 知识点详情页接口补充 RAG 关联原文列表
2. 批量重生成教材全部 Chunk 向量接口

### 3.2 后端 B：账号鉴权 + LangGraph RAG 改造 + 会话持久化

#### P0 必做功能

1. Session 持久化存储

   废弃内存 InMemorySessionStore，新增 session 数据库表，会话绑定 user_id、kp_id、material_id；页面刷新可读取历史对话

2. LangGraph 新增 retrieve 检索节点（线性流程插入 evaluate 前）

   

   流程：用户输入 → retrieve 节点调用 RAG 接口获取跨章节原文 → 拼接原有 KP 固定页码 Chunk → 一并注入 evaluate 评判 Prompt

3. 所有费曼接口增加 Token 鉴权拦截

4. 动态 greeting、chat 对话接口兼容 user_id，会话归属当前登录用户

#### P1 次要功能

1. 历史对话列表查询接口
2. 历史费曼四维报告查询接口

### 3.3 前端页面功能

#### P0 必做功能

1. 登录 / 注册页面

   - 未登录访问任意页面自动跳转登录页；支持切换登录 / 注册 Tab
   - 表单校验：账号密码非空、长度限制；错误提示

2. 全局请求拦截器

   登录后存储 Token 到 localStorage，所有接口请求自动携带 Authorization Header；Token 失效跳转登录页

3. 顶部导航用户栏

   登录态展示用户名、退出登录按钮；游客态展示「去登录」按钮

4. 全页面数据过滤

   上传教材、知识点树、对话列表仅展示当前登录用户 /guest 数据

5. 原有上传、四级选择、对话、报告页面兼容两套用户模式

#### P1 次要功能

1. 个人中心页面：我的教材、历史对话、历史报告列表
2. 知识点详情展示 RAG 召回的关联原文折叠面板

## 四、完整用户流程

### 4.1 账号基础流程（游客 ↔ 登录用户）

1. 游客模式（默认）

   - 无需登录，可正常上传 PDF、解析知识点、费曼追问；所有数据归属 user_id=guest
   - 页面顶部展示「去登录」按钮，关闭页面后新建会话，历史数据保留在 guest 账号下

2. 注册流程

   首页 / 任意页面点击去登录 → 切换注册 Tab → 填写账号、密码 → 提交注册 → 自动登录跳转上传页

3. 登录流程

   进入登录页 → 输入账号密码 → 校验通过，返回 Token 存储本地 → 刷新页面，展示个人上传教材

4. 退出登录

   顶部用户栏点击退出 → 清空本地 Token → 页面刷新切回游客模式

### 4.2 RAG 增强费曼主流程（叠加原有第四周流程）

1. 用户上传 PDF，完成全套解析、切片、知识点抽取、rubric 生成；后台异步执行 Chunk 向量化入库

2. 用户四级级联选中知识点，进入对话页，展示动态 greeting

3. 用户输入讲解内容，进入 LangGraph 流程：

   1）retrieve 节点：以用户讲解文本为 query，调用 RAG 接口召回当前教材 Top3 语义相关 Chunk

   2）evaluate 节点：拼接「KP 固定页码原文 + RAG 跨章节召回原文 + 四维 rubric」注入评判 Prompt

   3）执行原有打分、追问逻辑，最多 3 轮对话

4. 对话结束生成四维雷达报告；会话持久化保存，刷新页面可继续查看对话

### 4.3 异常分支处理

1. Token 过期 / 非法 Token：所有接口返回 401，前端自动跳转登录页
2. RAG 向量库未生成完成（教材还在向量化）：检索接口返回空列表，仅使用原有 KP 页码原文兜底，不阻断对话
3. 用户删除教材：同步删除向量库内对应 Chunk 向量，历史会话中该教材会话保留但无法继续讲解
4. 游客切换登录：guest 上传的教材不会自动迁移至个人账号，需手动提示用户重新上传
5. Embedding 接口调用失败：标记 Chunk 向量生成失败，检索时自动跳过该 Chunk，不阻塞整体流程

## 五、数据模型与数据库变更

### 5.1 新增数据表（SQLite）

#### 1. user 用户表

sql

```
CREATE TABLE "user" (
  id TEXT PRIMARY KEY, -- user-xxx
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL, -- 加密存储，不存明文
  created_at TEXT NOT NULL -- ISO8601
);
```

#### 2. session 持久化会话表（替代内存存储）

sql

```
CREATE TABLE session (
  session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  material_id TEXT,
  chapter_id TEXT,
  kp_id TEXT,
  chat_history TEXT NOT NULL, -- JSON数组存储对话记录
  report_data TEXT, -- 最终四维报告JSON
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_session_user ON session(user_id);
```

### 5.2 原有四张表新增 user_id 字段（升级脚本）

sql

```
-- 教材表新增用户归属
ALTER TABLE material ADD COLUMN user_id TEXT NOT NULL DEFAULT 'guest' REFERENCES "user"(id);
CREATE INDEX idx_material_user ON material(user_id);

-- 章节
ALTER TABLE chapter ADD COLUMN user_id TEXT NOT NULL DEFAULT 'guest';
CREATE INDEX idx_chapter_user ON chapter(user_id);

-- 切片
ALTER TABLE chunk ADD COLUMN user_id TEXT NOT NULL DEFAULT 'guest';
CREATE INDEX idx_chunk_user ON chunk(user_id);

-- 知识点
ALTER TABLE kp ADD COLUMN user_id TEXT NOT NULL DEFAULT 'guest';
CREATE INDEX idx_kp_user ON kp(user_id);
```

### 5.3 向量库存储说明（Chroma，独立文件存储，不进 SQLite）

- 集合命名规则：`vec_mat_{material_id}`，一本教材对应一个向量集合
- 单条向量存储结构：
  - id：chunk-{chunk_id}
  - embedding：float 数组向量
  - metadata：`{"page_no": int, "text": str, "chunk_id": str}`
- 生命周期：教材创建 → 异步新增向量；教材删除 → 删除对应向量集合

### 5.4 核心字段设计约束

1. user_id 默认值`guest`，保证存量无用户数据兼容；
2. 所有资源查询接口强制携带当前用户 user_id，隔离数据；
3. Chunk 向量化为异步后置任务，不阻塞 PDF 解析主流程；
4. RAG 仅在当前 material_id 向量集合检索，禁止跨教材查询。

## 六、完整接口契约（新增 + 改造接口）

### 6.1 后端 A 新增接口：用户账号模块

#### 1. 用户注册 POST /api/v1/auth/register

请求体

```
{
  "username": "student01",
  "password": "123456abc"
}
```

响应 200

json

```
{
  "code": 200,
  "msg": "注册成功，请登录",
  "data": {
    "user_id": "user-001"
  }
}
```

错误响应 400（账号已存在）

json

```
{
  "code": 400,
  "msg": "该用户名已被注册",
  "data": null
}
```

#### 2. 用户登录 POST /api/v1/auth/login

请求体

json

```
{
  "username": "student01",
  "password": "123456abc"
}
```

响应 200

json

```
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user_id": "user-001",
    "username": "student01"
  }
}
```

#### 3. 获取当前登录用户信息 GET /api/v1/auth/current

请求 Header：`Authorization: Bearer {token}`

响应

json

```
{
  "code": 200,
  "msg": "success",
  "data": {
    "user_id": "user-001",
    "username": "student01"
  }
}
```

### 6.2 后端 A 新增接口：RAG 向量检索模块

#### 1. 教材语义检索 GET /api/v1/material/{material_id}/retrieve

请求参数：

`query`: 讲解文本

`top_k`: 3（固定）

Header 携带 token

响应

json

```
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "chunk_id": "chunk-1",
      "page_no": 31,
      "text": "Dijkstra算法贪心策略，每次选取距离起点最近未访问节点",
      "score": 0.96
    },
    {
      "chunk_id": "chunk-12",
      "page_no": 68,
      "text": "贪心算法适用前提：局部最优可推导全局最优，非负权图满足该条件",
      "score": 0.89
    }
  ]
}
```

#### 2. 手动触发教材向量重生成 POST /api/v1/material/{material_id}/embedding/rebuild

响应

json

```
{
  "code": 200,
  "msg": "向量重建任务已异步启动",
  "data": {
    "material_id": "mat-demo"
  }
}
```

### 6.3 后端 A 原有接口改造说明

所有原有接口（上传、查询知识点树、kp 增删改查）新增鉴权逻辑，自动从 Token 获取 user_id，SQL 查询增加`user_id = ?`过滤条件；游客无 token 则默认 user_id=guest。

### 6.4 后端 B 改造接口：会话持久化 + RAG 注入

#### 1. 创建 / 发起对话 POST /api/v1/feynman/chat

新增入参自动携带 user_id，会话写入 session 表，retrieve 节点内部自动调用 RAG 检索接口，前端无感知改动；请求响应结构同第四周，仅底层增加 RAG 文本拼接。

#### 2. 获取历史会话列表 GET /api/v1/feynman/sessions（P1）

Header 带 token

json

```
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "session_id": "ses-001",
      "kp_name": "Dijkstra算法",
      "material_title": "数据结构教材",
      "created_at": "2026-07-19T14:20:00"
    }
  ]
}
```

#### 3. 查询单条历史会话详情 GET /api/v1/feynman/sessions/{session_id}

返回完整 chat_history 与 report_data。

## 七、全局 Mock 数据（前后端并行开发专用）

### 7.1 账号模块 Mock

#### Mock 登录返回

j

```
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "token": "mock-token-demo-123",
    "user_id": "user-demo",
    "username": "teststudent"
  }
}
```

#### Mock 当前用户信息

json

```
{
  "code": 200,
  "msg": "success",
  "data": {
    "user_id": "user-demo",
    "username": "teststudent"
  }
}
```

### 7.2 RAG 检索 Mock（mat-demo 教材）

GET /api/v1/material/mat-demo/retrieve?query=Dijkstra 贪心原理 & top_k=3

json

```
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "chunk_id": "chunk-1",
      "page_no": 30,
      "text": "Dijkstra算法用于求解非负权带权图单源最短路径，核心为贪心策略。",
      "score": 0.97
    },
    {
      "chunk_id": "chunk-8",
      "page_no": 36,
      "text": "贪心算法全局最优成立条件：不存在后续更短路径，依赖边权非负约束。",
      "score": 0.91
    },
    {
      "chunk_id": "chunk-15",
      "page_no": 72,
      "text": "松弛操作会更新相邻节点最短距离，是Dijkstra核心执行步骤。",
      "score": 0.85
    }
  ]
}
```

### 7.3 知识点树 Mock（区分用户隔离）

GET /api/v1/material/tree?subject = 计算机

Header 携带 mock-token，自动过滤 user-demo 数据

json

```
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "material_id": "mat-demo",
      "title": "数据结构教材",
      "user_id": "user-demo",
      "chapters": [
        {
          "chapter_id": "ch-demo",
          "title": "第6章 图论",
          "knowledge_points": [
            {
              "kp_id": "kp-demo",
              "name": "Dijkstra 算法",
              "summary": "非负权图求单源最短路径的贪心算法"
            }
          ]
        }
      ]
    }
  ]
}
```

### 7.4 历史会话 Mock（P1）

GET /api/v1/feynman/sessions

json

```
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "session_id": "ses-demo",
      "kp_name": "Dijkstra 算法",
      "material_title": "数据结构教材",
      "created_at": "2026-07-20T10:30:00"
    }
  ]
}
```

## 八、前端页面交互简要说明

原型链接：https://www.figma.com/make/psdZhD3SJbnxU3wwr3upXT/Design-chat-interface?t=HwDQgUDvzZvkqT6X-1&preview-route=%2Fauth

![image-20260720150435772](C:/Users/Pamela/AppData/Roaming/Typora/typora-user-images/image-20260720150435772.png)

### 8.1 登录 / 注册页

1. 双 Tab 切换：登录 / 注册
2. 表单校验：账号 4-16 位，密码 6 位以上；
3. 登录成功存储 token 到 localStorage，跳转上传页面；
4. 401 无权限自动跳转该页面。

### 8.2 顶部导航栏

- 游客态：右侧按钮「去登录」
- 登录态：展示用户名 + 下拉「退出登录」
- 退出登录清空本地 token，刷新页面回到游客模式。

### 8.3 上传页、四级选择页

所有教材、知识点列表仅展示当前 user_id 绑定资源；游客仅展示 guest 数据。

### 8.4 对话页面改造（无 UI 改动，底层逻辑）

1. 会话自动绑定当前 user_id，刷新页面读取历史对话；
2. RAG 检索逻辑完全后端封装，前端无需额外操作；
3. 面包屑、greeting、报告页面复用第四周代码。

### 8.5 P1 个人中心页面

三个 Tab：我的教材、历史对话、历史报告；点击可跳转对应知识点 / 对话页面。

## 九、验收标准

### 9.1 账号体系验收

1. 注册：新账号创建成功，重复账号返回报错；
2. 登录：账号密码匹配下发 token，错误密码提示失败；
3. 鉴权：无 token 访问资源接口返回 401，跳转登录；
4. 数据隔离：A 登录仅看自己上传教材，看不到 B 用户资源；
5. 游客兼容：未登录可完整使用全部原有功能，数据归属 guest；
6. 会话持久化：关闭页面重新打开，历史对话完整保留。

### 9.2 RAG 向量检索验收

1. 教材解析完成后自动异步生成 Chunk 向量，向量库存在对应集合；
2. 对话讲解时后端自动调用 retrieve 接口，日志打印召回跨章节文本；
3. LLM 评判 Prompt 同时包含 KP 固定原文 + RAG 召回原文；
4. 教材删除同步清空向量库对应数据；
5. 向量生成失败时自动降级，仅使用原有页码原文，对话不中断。

### 9.3 前端验收

1. 未登录访问任意页面自动跳转登录；
2. 登录后顶部展示用户名，退出切换游客；
3. 个人资源列表过滤正确，无其他用户数据；
4. 对话刷新后历史记录不丢失；
5. Mock 环境下所有接口返回样例数据，页面渲染正常。

## 十、非功能需求与风险应对

### 10.1 非功能约束

1. 性能：单教材≤200 页，Chunk 向量化总耗时≤30s，异步后台执行不阻塞前端；
2. 兼容：桌面 Chrome/Edge；
3. 存储：向量库本地文件存储，不依赖第三方向量服务；
4. 异步：Embedding 任务复用 FastAPI BackgroundTasks，不引入 Celery；
5. Token 有效期：默认 24 小时，过期自动拦截跳转登录。

### 10.2 风险与应对方案

表格

|                   风险                    | 等级 |                           应对策略                           |
| :---------------------------------------: | :--: | :----------------------------------------------------------: |
| 同时开发账号 + RAG 双模块，一周工作量溢出 |  高  | 严格区分 P0/P1，个人中心、RAG 前端展示功能做不完顺延第六周；仅保证核心闭环 |
|     全表新增 user_id 引发存量数据 bug     |  中  |  默认 guest 兜底，不强制迁移历史数据；查询统一过滤 user_id   |
|       Embedding 接口调用超时、失败        |  中  | 捕获异常跳过失败 Chunk，检索降级仅使用 KP 页码原文，不阻断对话流程 |
|   Token 前端存储丢失、鉴权拦截遗漏接口    |  中  |      统一全局请求拦截器，所有接口统一校验 401 跳转登录       |
|       向量库文件过大、占用本地磁盘        |  低  |     删除教材同步清理向量集合，限制单教材最大页数 200 页      |
| LangGraph 新增 retrieve 节点引发流程阻塞  |  中  |  检索接口增加 10s 超时，超时直接跳过 RAG 逻辑，兜底原有流程  |

## 附录 A：本周砍项（顺延 V1.5/V2）

1. RAG：跨教材检索、向量重排、Embedding 微调、独立全文问答；
2. 账号：手机号 / 第三方登录、密码找回、会员、头像、多端同步；
3. 拓展功能：知识点关联图谱、学情统计、批量教材导入、OCR 扫描件解析。