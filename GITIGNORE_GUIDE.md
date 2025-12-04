# .gitignore 文件说明

## 为什么看不到这个文件？

`.gitignore` 是一个**隐藏文件**（文件名以点开头），在 Finder 中默认不显示。

## 如何查看和发送

### 方法一：使用终端查看（推荐）

在终端运行：

```bash
cd /Users/zhoudt/Downloads/project/CollageStates
cat .gitignore
```

### 方法二：在 Finder 中显示隐藏文件

在 Finder 中按快捷键：
- **显示隐藏文件**：`Shift + Command + .`（句号）
- **隐藏文件**：再次按 `Shift + Command + .`

然后就能看到 `.gitignore` 文件了。

### 方法三：使用文本编辑器打开

在终端运行：

```bash
cd /Users/zhoudt/Downloads/project/CollageStates
open -a TextEdit .gitignore
```

或者使用 VS Code：

```bash
code .gitignore
```

---

## .gitignore 文件完整内容

如果你需要创建或复制这个文件，内容如下：

```gitignore
# Dependencies
node_modules/

# Environment variables
.env
.env.local

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Build outputs
dist/
build/
```

---

## 如何创建这个文件

### 方法一：使用终端创建

```bash
cd /Users/zhoudt/Downloads/project/CollageStates
cat > .gitignore << 'EOF'
# Dependencies
node_modules/

# Environment variables
.env
.env.local

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Build outputs
dist/
build/
EOF
```

### 方法二：使用文本编辑器创建

1. 打开文本编辑器（TextEdit 或 VS Code）
2. 创建新文件
3. 复制上面的内容
4. 保存文件名为：`.gitignore`（注意前面的点）
5. 保存位置：项目根目录

---

## 发送给别人的方式

### 方式一：通过 Git 仓库发送

如果项目在 Git 仓库中，`.gitignore` 会自动包含在仓库中，别人 clone 或下载项目时就会得到这个文件。

### 方式二：复制文件内容

1. 查看文件内容（使用上面的方法）
2. 复制文件内容
3. 发送给别人，让他们自己创建

### 方式三：创建可见的说明文件

把这个说明文档发送给别人，让他们按照说明创建 `.gitignore` 文件。

---

## 重要提示

- `.gitignore` 文件名前面必须有一个点（`.`）
- 这个文件必须放在项目根目录
- 文件不需要扩展名
- 如果文件名是 `gitignore`（没有点），Git 不会识别

---

**创建日期**：2024年12月

