# WorkHub Demo

[English](README.md) | [简体中文](README.zh-CN.md)

> 一个集成即时消息、企业邮件与可解释 AI Skills 的轻量级企业协作 Demo。

WorkHub 是一个面向全栈工程师求职展示的桌面端协作应用。项目保留了原有的私聊和本地邮件业务，并演示如何将已有业务 Service 封装为可复用的 AI Skills，再由 Assistant 根据用户意图选择并调用。

## 项目特点

### 消息

- 5 位预置团队成员，包含在线状态、职位、最新消息和未读数
- 基于 SQLite 的一对一聊天记录
- 通过 REST API 发送消息，前端支持乐观更新
- 打开会话时更新已读状态

### 邮件

- 收件箱、星标、已发送、草稿和垃圾箱
- 三栏式邮件界面，支持未读与星标状态
- 支持查看、回复、转发、撰写和移入垃圾箱
- `EmailService` 保留了未来接入 Gmail、IMAP 或 Microsoft Graph 的边界

### AI Assistant

- 根据自然语言请求选择 WorkHub 现有消息或邮件能力
- 清晰展示每次调用的 Skill、参数与返回结果
- 支持对聊天搜索结果进行简单总结
- 默认无需外部 API Key

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 前端 | React、TypeScript、Vite、Tailwind CSS、Radix Primitives、Lucide Icons |
| 后端 | Python、FastAPI、SQLAlchemy、Pydantic |
| 数据库 | SQLite |
| Agent | 基于显式 Skills 的确定性意图路由 |
| 测试 | Pytest、Vitest、Testing Library |

## 架构

```text
用户
  |
  v
AI Assistant UI
  |
  v
EnterpriseAssistant
  |
  v
EnterpriseSkills
  +-- search_messages(query)
  +-- search_emails(query)
  +-- summarize_messages(messages)
  |
  v
现有 WorkHub Services
  +-- MessageService
  +-- EmailService
  |
  v
SQLAlchemy + SQLite
```

## AI Skills Demo

WorkHub 本身已经具有企业聊天和邮件功能。本次升级没有为 AI Demo 重新伪造一套业务数据，而是将原有 `MessageService` 和 `EmailService` 的能力封装到独立 Skill 层。

当前版本使用 **deterministic intent routing（确定性意图路由）**，使 Skill 调用过程可观察、可复现。它不声称 Agent 已经具有自主推理能力。未来如果接入 LLM Tool Calling，只需替换路由决策层，底层业务 Skills 不需要重新实现。

## 快速开始

### 后端

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8010 --reload
```

后端：[http://127.0.0.1:8010](http://127.0.0.1:8010)

API 文档：[http://127.0.0.1:8010/docs](http://127.0.0.1:8010/docs)

### 前端

```bash
cd frontend
npm install
npm run dev
```

前端：[http://localhost:5173](http://localhost:5173)

## 演示流程

1. 打开 **Messages**，展示 WorkHub 已有的聊天数据。
2. 打开 **AI Assistant**。
3. 输入 `Find chat messages about acceptance criteria.`，展示 `search_messages` 的参数与返回数据。
4. 输入 `Find and summarize chat messages about acceptance criteria.`，展示 `search_messages` 和 `summarize_messages` 的连续调用。
5. 输入 `Find customer emails.` 或 `查一下客户邮件`，展示 Agent 切换到 `search_emails`。
6. 返回 **Messages** 或 **Email**，说明原有业务流程仍然可用。

## 截图

### WorkHub 消息

![WorkHub 消息](screenshots/workhub-messages.png)

### AI Assistant 调用 `search_messages`

![AI Assistant 调用 search_messages](screenshots/workhub-ai-search-messages.png)

### AI Assistant 调用 `search_messages` + `summarize_messages`

![AI Assistant 调用 search_messages 和 summarize_messages](screenshots/workhub-ai-summarize-messages.png)

### AI Assistant 调用 `search_emails`

![AI Assistant 调用 search_emails](screenshots/workhub-ai-search-emails.png)

### WorkHub 邮件

![WorkHub 邮件](screenshots/workhub-email.png)

## 测试与构建

```bash
# 后端
cd backend
pytest -q

# 前端
cd frontend
npm test -- --run
npm run build
```

## 当前限制

- Agent 路由和总结使用确定性规则，不是 LLM 自主推理。
- 搜索使用数据库文本匹配，不是语义搜索或向量检索。
- 当前没有登录、权限和多租户隔离。
- 本 Demo 不包含 Redis、后台任务、MCP、RAG、WebSocket 实时消息或外部邮件服务。

## 后续规划

- 实时消息
- Gmail / Outlook 集成
- 日历
- 可选的 LLM Tool Calling Provider
- 面向更大知识源的语义检索
- 身份认证与基于角色的访问控制
