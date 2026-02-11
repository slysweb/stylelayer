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

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_DOMAIN`
- `JIMENG_API_KEY`
- `JIMENG_ENDPOINT`
