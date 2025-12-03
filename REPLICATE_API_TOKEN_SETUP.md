# Replicate API Token 申请指南

本文档详细说明如何注册 Replicate 账号并获取 API Token。

## 目录

- [第一步：访问 Replicate 官网](#第一步访问-replicate-官网)
- [第二步：注册账号](#第二步注册账号)
- [第三步：登录账号](#第三步登录账号)
- [第四步：获取 API Token](#第四步获取-api-token)
- [第五步：配置到项目](#第五步配置到项目)
- [第六步：验证配置](#第六步验证配置)
- [常见问题](#常见问题)
- [相关链接](#相关链接)

---

## 第一步：访问 Replicate 官网

1. 打开浏览器，访问 Replicate 官网：
   - **官网地址**：https://replicate.com

2. 点击右上角的 **"Sign Up"**（注册）或 **"Get Started"**（开始使用）按钮

---

## 第二步：注册账号

Replicate 提供两种注册方式：

### 方式一：使用邮箱注册（推荐）

1. 在注册页面输入你的**邮箱地址**
2. 设置**密码**（至少 8 个字符）
3. 点击 **"Sign Up"** 按钮
4. 查收验证邮件，点击邮件中的验证链接完成邮箱验证

### 方式二：使用第三方账号快速注册

1. 点击 **GitHub** 或 **Google** 图标
2. 授权登录，系统会自动创建账号
3. 无需邮箱验证，可直接使用

**推荐使用 GitHub 账号注册**，方便快捷且无需邮箱验证。

---

## 第三步：登录账号

1. 如果已注册，访问：https://replicate.com
2. 点击右上角 **"Sign In"**（登录）按钮
3. 输入邮箱和密码，或使用第三方账号登录

---

## 第四步：获取 API Token

### 方法一：通过导航菜单

1. 登录后，点击右上角**头像图标**
2. 在下拉菜单中选择 **"Account"**（账户）或 **"Settings"**（设置）
3. 进入账户设置页面

### 方法二：直接访问（推荐）

直接访问 API Tokens 页面：
- **链接**：https://replicate.com/account/api-tokens

### 创建 Token

1. 在账户设置页面，找到 **"API Tokens"**（API 令牌）部分
2. 点击 **"Create Token"**（创建令牌）或 **"New Token"**（新建令牌）按钮
3. 输入 Token 名称（例如：`CollageStates Project` 或 `我的拼贴工具`）
4. 点击 **"Create"**（创建）或 **"Generate"**（生成）按钮
5. **重要**：Token 创建后只显示一次，请立即复制并妥善保存

### Token 格式说明

- Replicate API Token 通常以 `r8_` 开头
- 长度约为 40-50 个字符
- 格式示例：`r8_YO0J4crqKjgGaVAU71TVe1PGpxSEzeQ43gKRk`

**⚠️ 安全提示**：
- Token 一旦关闭页面就无法再次查看
- 如果忘记或丢失 Token，需要删除旧 Token 并创建新 Token
- 不要将 Token 分享给他人或提交到公开代码仓库

---

## 第五步：配置到项目

### 1. 创建或编辑 `.env` 文件

在项目根目录（`CollageStates/`）创建或编辑 `.env` 文件：

```env
REPLICATE_API_TOKEN=r8_你的实际Token
PORT=3000
```

### 2. 替换 Token

将 `r8_你的实际Token` 替换为你刚才复制的实际 API Token。

**示例**：
```env
REPLICATE_API_TOKEN=r8_YO0J4crqKjgGaVAU71TVe1PGpxSEzeQ43gKRk
PORT=3000
```

### 3. 保存文件

保存 `.env` 文件，确保：
- 文件位于项目根目录
- Token 前后没有多余的空格
- 文件编码为 UTF-8

---

## 第六步：验证配置

### 方法一：启动服务器验证

1. 在项目根目录运行：
   ```bash
   npm start
   ```

2. 查看控制台输出：
   - ✅ 如果看到：`Replicate API Token: Configured`
   - ❌ 如果看到：`Replicate API Token: NOT CONFIGURED - Please set REPLICATE_API_TOKEN in .env file`

### 方法二：测试功能

1. 启动服务器后，访问：http://localhost:3000
2. 点击 **"生成背景"** 按钮
3. 如果配置正确，系统会调用 Replicate API 生成背景图片
4. 如果配置错误，会显示错误提示

### 常见错误

| 错误信息 | 原因 | 解决方法 |
|---------|------|---------|
| `REPLICATE_API_TOKEN is not configured` | `.env` 文件不存在或 Token 未设置 | 检查 `.env` 文件是否存在，确认 Token 已正确填写 |
| `401 Unauthorized` | Token 无效或已过期 | 重新生成 Token 并更新 `.env` 文件 |
| `403 Forbidden` | Token 权限不足 | 检查账号状态，确认 Token 有效 |
| `Insufficient credits` | 账户余额不足 | 充值或检查免费额度 |

---

## 常见问题

### Q1: Token 丢失了怎么办？

**A**: 如果 Token 丢失，需要：
1. 访问 https://replicate.com/account/api-tokens
2. 找到旧的 Token，点击 **"Delete"**（删除）
3. 创建新的 Token
4. 更新 `.env` 文件中的 Token

### Q2: 可以创建多个 Token 吗？

**A**: 可以。你可以为不同的项目创建不同的 Token，方便管理和撤销。

### Q3: Token 会过期吗？

**A**: Token 默认不会过期，除非你手动删除。但建议定期检查 Token 的有效性。

### Q4: 如何查看 Token 的使用情况？

**A**: 
1. 访问 https://replicate.com/account
2. 查看 **"Usage"**（使用情况）部分
3. 可以查看 API 调用次数、费用等信息

### Q5: 免费额度是多少？

**A**: Replicate 通常提供一定的免费试用额度，具体额度请查看：
- 账户页面：https://replicate.com/account
- 定价页面：https://replicate.com/pricing

### Q6: 如何保护 Token 安全？

**A**: 
- ✅ 将 `.env` 文件添加到 `.gitignore`（项目已配置）
- ✅ 不要在代码中硬编码 Token
- ✅ 不要将 Token 提交到 Git 仓库
- ✅ 不要分享 Token 给他人
- ✅ 定期轮换 Token（删除旧 Token，创建新 Token）

---

## 相关链接

- **Replicate 官网**：https://replicate.com
- **账户设置**：https://replicate.com/account
- **API Tokens 页面**：https://replicate.com/account/api-tokens
- **API 文档**：https://replicate.com/docs
- **定价信息**：https://replicate.com/pricing
- **支持中心**：https://replicate.com/docs

---

## 快速参考

### 完整流程总结

1. ✅ 访问 https://replicate.com
2. ✅ 注册/登录账号
3. ✅ 访问 https://replicate.com/account/api-tokens
4. ✅ 创建新 Token 并复制
5. ✅ 在项目根目录创建 `.env` 文件
6. ✅ 添加 `REPLICATE_API_TOKEN=你的Token`
7. ✅ 启动服务器验证配置

### 文件位置

- **`.env` 文件**：`/Users/zhoudt/Downloads/project/CollageStates/.env`
- **`.gitignore` 文件**：`/Users/zhoudt/Downloads/project/CollageStates/.gitignore`（已配置忽略 `.env`）

---

**最后更新**：2024年12月

**文档版本**：1.0

