# Cloudflare 部署说明

## Worker 名称

`wrangler.jsonc` 中的 `name` 和 `service` 必须与 Cloudflare 控制台中该项目的 Worker 名称一致。当前配置为 `long-block-3681`（与你的 Cloudflare 项目匹配）。

若在 Dashboard 中重命名了 Worker，请同步修改 `wrangler.jsonc` 中的 `name` 和 `services[0].service`。

## 构建配置

在 Cloudflare Pages / Workers 的 Git 集成中，请将构建配置修改为：

| 配置项 | 值 |
|--------|-----|
| **Build command** | `npx opennextjs-cloudflare build` |
| **Deploy command** | `npx opennextjs-cloudflare deploy` |

或使用 npm scripts：

| 配置项 | 值 |
|--------|-----|
| **Build command** | `npm run deploy` |

（`npm run deploy` 会同时执行 build 和 deploy）

## 环境变量

在 Cloudflare 控制台的项目设置中配置以下环境变量：

**Google OAuth / 会话**：

- `GOOGLE_CLIENT_ID` — 从 [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 创建 OAuth 2.0 客户端 ID
- `GOOGLE_CLIENT_SECRET` — 同上
- `AUTH_SECRET` — 会话签名密钥（至少 32 字符，可用 `openssl rand -base64 32` 生成）

**在 Google Cloud Console 配置**：**APIs & Services** → **Credentials** → OAuth 2.0 客户端 → 添加授权重定向 URI：
- 开发：`http://localhost:3000/api/auth/callback`
- 生产：`https://你的域名/api/auth/callback`

**R2 / 业务**：

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_DOMAIN`
- `JIMENG_ACCESS_KEY`
- `JIMENG_SECRET_KEY`
- `DATABASE_ID`（如使用 D1）

**重要**：变量应配置在 **Cloudflare Pages / Worker → Settings → Environment variables** 中。

## R2 配置

已改为 **代理上传**：前端将文件 POST 到 `/api/upload`，由服务端通过 R2 binding 上传，**无需 CORS**。

`wrangler.jsonc` 中的 `r2_buckets` 需与你的桶名一致（当前为 `stylelayer`）。若桶名不同，请修改 `bucket_name`。
