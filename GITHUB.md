# 将项目推送到 GitHub

按照以下步骤将 Mock Server Pro 推送到您的 GitHub 仓库：

## 1. 创建 GitHub 仓库

1. 登录您的 GitHub 账户
2. 创建一个新的仓库，命名为 `mock-server-pro`
3. 不要初始化仓库（不勾选 "Initialize this repository with a README"）

## 2. 添加远程仓库

```bash
# 替换 YOUR_USERNAME 为您的 GitHub 用户名
git remote add origin https://github.com/YOUR_USERNAME/mock-server-pro.git
```

## 3. 推送代码

```bash
# 推送到主分支
git push -u origin main
```

## 4. 验证

1. 访问 https://github.com/YOUR_USERNAME/mock-server-pro
2. 确认代码已成功推送

## 5. 发布到 NPM (可选)

如果您想发布到 NPM，执行以下命令：

```bash
# 登录 NPM
npm login

# 发布
npm publish
```

## 注意事项

- 确保您的 GitHub 账户已设置了 SSH 密钥或记住了您的登录凭证
- 如果想要推送到私有仓库，确保您的账户支持创建私有仓库
- 您可能需要根据 GitHub 的要求设置双因素认证 