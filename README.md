# 个人主页（Homepage）

暗色、极简、画廊式的作品集网站（风格参考 christopherirelandcreative.com），部署在 **Cloudflare Pages** 上，内容存储于 **KV**，可通过内置管理后台编辑。

## 技术栈

- 静态前端位于 `public/`（无构建步骤）
- `functions/api/` 中的 Cloudflare Pages Functions 提供 `/api/config`
- Cloudflare KV（`HOMEPAGE_KV`）将整站配置存为一份 JSON 文档
- 管理员密钥存放在 Cloudflare 环境变量（`ADMIN_KEY`）中，绝不进入代码仓库

## 目录结构

```
├── wrangler.toml
├── public/
│   ├── index.html      # 前台页面
│   ├── admin.html      # 管理后台（/admin.html）
│   ├── css/{main,admin}.css
│   └── js/{main,admin}.js
└── functions/
    └── api/config.js   # GET/PUT /api/config，Bearer 鉴权，KV 读写
```

## 接口说明

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| GET | `/api/config` | 无（可用 Bearer 探测校验密钥） | 返回站点配置；KV 为空时回退到内置默认值 |
| PUT | `/api/config` | `Authorization: Bearer <ADMIN_KEY>` | 校验 JSON 请求体后写入 KV |

## 部署

### 方案 A — Git 集成（推荐）

1. 将本仓库推送到 GitHub。
2. 在 Cloudflare 控制台：**Workers & Pages → Create → Pages → Connect to Git**，选择该仓库。
   - Build command：留空
   - Build output directory：`public`
3. 创建 KV 命名空间：
   ```sh
   wrangler kv namespace create HOMEPAGE_KV
   ```
   将返回的 `id` 填入 `wrangler.toml`：
   ```toml
   [[kv_namespaces]]
   binding = "HOMEPAGE_KV"
   id = "<your-kv-namespace-id>"
   ```
   （也可以直接在控制台绑定：**Settings → Functions → KV namespace bindings**）
4. 设置管理员密钥：**Settings → Environment variables → Add variable**
   - 名称：`ADMIN_KEY`
   - 值：一段较长的随机字符串（例如 `openssl rand -hex 32`）
5. 部署。在你从管理后台保存内容之前，站点会显示默认配置。

### 方案 B — Wrangler CLI

```sh
npm i -g wrangler
wrangler login
wrangler kv namespace create HOMEPAGE_KV
# 将返回的 id 填入 wrangler.toml
wrangler pages deploy public --project-name homepage
wrangler pages secret put ADMIN_KEY --project-name homepage
```

> 注意：KV 命名空间的 id 无法在首次部署时完全自动创建，创建 KV 命名空间与设置 `ADMIN_KEY` 属于一次性人工步骤（控制台或 CLI）。完成之后，所有内容（文案、链接、作品、页脚等）都可以在 `/admin.html` 中编辑。

## 管理后台

打开 `https://<你的域名>/admin.html`，输入 `ADMIN_KEY`，在任意 Tab 中编辑（Site / Hero / Navigation / Sections / Works / Footer / Raw JSON），然后点击 **Save All**。密钥仅保存在 `sessionStorage` 中。

## 本地开发

```sh
wrangler pages dev public --kv HOMEPAGE_KV
```