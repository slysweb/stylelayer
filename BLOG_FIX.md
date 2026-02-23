# 修复博客构建错误

## 问题

构建时出现 `Module not found: Can't resolve '../../content'` 错误，这是因为 velite 还没有生成 `content/index.ts` 文件。

## 解决方案

我已经创建了一个临时的占位文件 `content/index.ts`，现在构建应该可以通过了。

### 步骤 1: 运行 velite 生成内容

在终端中运行：

```bash
npm run velite
```

这会处理 `/content/blog` 目录中的所有 MDX 文件，并生成 `content/index.ts` 文件。

### 步骤 2: 重新启动开发服务器

```bash
npm run dev
```

现在 velite 会自动运行（因为 `package.json` 中的 `dev` 脚本已经配置为 `velite && next dev`），博客内容应该可以正常显示了。

## 验证

1. 访问 `http://localhost:3000/blog` - 应该能看到博客列表
2. 访问 `http://localhost:3000/blog/example-post` - 应该能看到示例文章

## 注意事项

- `content/index.ts` 和 `content/index.d.ts` 是 velite 自动生成的文件，已在 `.gitignore` 中忽略
- 每次添加或修改博客文章后，velite 会自动重新生成这些文件
- 如果手动运行 `npm run velite`，它会重新处理所有 MDX 文件

## 如果仍然遇到问题

1. 检查 velite 是否正确安装：
   ```bash
   npm list velite
   ```

2. 检查 MDX 文件格式是否正确（frontmatter 格式）

3. 查看 velite 的输出日志，确认是否有错误
