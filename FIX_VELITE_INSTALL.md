# 修复 Velite 安装问题

由于 `velite@^0.8.0` 版本不存在，我已经从 `package.json` 中移除了它。请按以下步骤安装：

## 步骤 1: 先安装其他依赖

```bash
npm install
```

这会安装所有其他依赖，包括 `@tailwindcss/typography`。

## 步骤 2: 单独安装 velite（使用最新版本）

```bash
npm install -D velite@latest
```

或者，如果你想查看可用的版本：

```bash
npm view velite versions
```

然后选择一个可用的版本安装，例如：

```bash
npm install -D velite@0.7.0
```

## 步骤 3: 验证安装

安装完成后，检查是否成功：

```bash
npm list velite
```

## 如果仍然遇到问题

### 选项 1: 清除缓存后重试

```bash
npm cache clean --force
npm install -D velite@latest
```

### 选项 2: 检查网络连接

确保可以访问 npm 注册表：

```bash
npm config get registry
```

如果需要使用国内镜像：

```bash
npm config set registry https://registry.npmmirror.com
npm install -D velite@latest
```

### 选项 3: 使用替代方案

如果 velite 确实无法安装，可以考虑使用其他内容管理方案：
- `contentlayer` (已停止维护)
- `next-mdx-remote`
- `mdx-bundler`

## 安装完成后

安装成功后，velite 会自动添加到 `package.json` 的 `devDependencies` 中。然后你可以：

1. 运行 `npm run dev` 启动开发服务器
2. Velite 会自动处理 `/content/blog` 目录中的 MDX 文件
3. 在代码中使用 `import { blog } from '@/lib/content'` 访问博客内容
