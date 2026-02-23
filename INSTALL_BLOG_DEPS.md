# 安装博客依赖说明

由于当前 shell 环境中找不到 npm，请在你的终端中运行以下命令来安装博客所需的依赖：

## 安装命令

```bash
cd /Users/liushaoping/Desktop/work/stylelayer
npm install velite @tailwindcss/typography
```

## 如果 npm 命令不可用

### 选项 1: 使用 nvm（如果已安装）

```bash
# 加载 nvm
source ~/.nvm/nvm.sh

# 使用 Node.js（如果已通过 nvm 安装）
nvm use default
# 或
nvm use node

# 然后安装依赖
npm install velite @tailwindcss/typography
```

### 选项 2: 使用 Homebrew 安装 Node.js

```bash
# 安装 Node.js（如果未安装）
brew install node

# 然后安装依赖
npm install velite @tailwindcss/typography
```

### 选项 3: 使用 fnm（Fast Node Manager）

```bash
# 如果使用 fnm
fnm use --install-if-missing
npm install velite @tailwindcss/typography
```

## 验证安装

安装完成后，可以验证：

```bash
npm list velite @tailwindcss/typography
```

## 下一步

安装完成后，Velite 会在你运行 `npm run dev` 或 `npm run build` 时自动处理 `/content/blog` 目录中的 MDX 文件。
