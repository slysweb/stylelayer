# Mac 开发环境设置指南

这是一份完整的指南，帮助你在新的 Mac 电脑上设置开发环境。

## 步骤 1: 安装 Homebrew（包管理器）

Homebrew 是 macOS 上最流行的包管理器，用于安装开发工具。

### 安装 Homebrew

在你的终端中运行以下命令：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

安装过程中会要求输入密码，并可能需要按回车键确认。

### 验证安装

```bash
brew --version
```

如果显示版本号，说明安装成功。

## 步骤 2: 安装 Node.js 和 npm

### 使用 Homebrew 安装 Node.js

```bash
brew install node
```

这会安装 Node.js 和 npm（Node Package Manager）。

### 验证安装

```bash
node --version
npm --version
```

如果两个命令都显示版本号，说明安装成功。

## 步骤 3: 安装项目依赖

进入项目目录并安装所有依赖（包括博客相关的依赖）：

```bash
cd /Users/liushaoping/Desktop/work/stylelayer
npm install
npm install velite @tailwindcss/typography
```

## 步骤 4: 验证项目设置

### 检查 Node.js 版本

确保 Node.js 版本符合要求（Next.js 15 需要 Node.js 18.17 或更高版本）：

```bash
node --version
```

### 运行开发服务器

```bash
npm run dev
```

如果一切正常，你应该能看到开发服务器启动，并且 Velite 会自动处理博客内容。

## 可选：安装 nvm（Node Version Manager）

如果你需要管理多个 Node.js 版本，可以安装 nvm：

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载 shell 配置
source ~/.zshrc

# 安装并使用最新的 LTS 版本
nvm install --lts
nvm use --lts
```

## 故障排除

### 如果 npm install 很慢

可以使用国内镜像加速：

```bash
npm config set registry https://registry.npmmirror.com
```

### 如果遇到权限问题

确保你有管理员权限，或者使用 `sudo`（不推荐，除非必要）：

```bash
sudo npm install -g npm
```

### 如果 Homebrew 安装失败

检查网络连接，或者尝试使用国内镜像：

```bash
# 使用国内镜像安装 Homebrew
/bin/bash -c "$(curl -fsSL https://gitee.com/ineo6/homebrew-install/raw/master/install.sh)"
```

## 下一步

安装完成后，你可以：

1. 运行 `npm run dev` 启动开发服务器
2. 在 `/content/blog` 目录中创建新的博客文章
3. 查看 `BLOG_SETUP.md` 了解如何使用博客功能

## 常用命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行代码检查
npm run lint

# 查看已安装的包
npm list
```
