#!/bin/bash
# 文件名建议保存为: git-sync.sh
# 用法: 把下面内容保存到项目根目录，chmod +x git-sync.sh && ./git-sync.sh

set -e  # 一旦有命令失败就退出

echo "GuluCoding 项目一键同步到 GitHub"

# 1. 添加所有文件（包括你本地新增的那个文档）
git add .

# 2. 看看到底改了啥（让你确认没加错东西）
echo "===== 即将提交的变更 ====="
git status --short
echo "============================"

# 3. 自动生成一次清晰的提交信息
git commit -m "feat: 完整迁移准备 + 新增本地技术文档

- 添加当前 Vite MVP 完整代码（ATTACHMENT_7_CURRENT_APP_ARCHITECTURE.md 等）
- 新增本地文档 ATTACHMENT_8_Technical_Architecture_V2.md（已放入 docs/）
- 同步至 GitHub 主分支，为 Next.js 重构做准备
$(date '+%Y-%m-%d')"

# 4. 设置远程仓库（只会在第一次运行时生效，后面不会重复）
if ! git remote | grep -q '^origin$'; then
  read -p "请输入你的 GitHub 仓库地址（例如 https://github.com/yourname/gulucoding-v2.git）: " repo_url
  git remote add origin "$repo_url"
  echo "已添加远程仓库 origin"
else
  echo "远程仓库 origin 已存在"
fi

# 5. 设置主分支为 main（GitHub 新仓库默认是 main）
git branch -M main

# 6. 推送到 GitHub（第一次会要求你登录）
echo "正在推送到 GitHub..."
git push -u origin main

echo "全部完成！"
echo "仓库地址：$(git remote get-url origin)"
echo "现在可以把链接发给团队成员了"
#
