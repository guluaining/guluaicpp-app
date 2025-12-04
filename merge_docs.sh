#!/usr/bin/env bash
# merge_docs.sh —— 把 docs/docs 合并到 docs，智能保留最新最全文稿，并提交推送

set -euo pipefail

# 1. 确认 docs/docs 存在
if [[ ! -d docs/docs ]]; then
  echo "📁 docs/docs 不存在，无需合并。"
  exit 0
fi

# 2. 合并文件（内容多 + 时间新优先）
echo "🔍 开始智能合并 docs/docs → docs ..."
for src in docs/docs/*; do
  [[ -e "$src" ]] || continue        # 跳过空目录
  file=$(basename "$src")
  dest="docs/$file"

  # 如果 docs 里没有，直接搬
  if [[ ! -e "$dest" ]]; then
    mv "$src" "$dest"
    echo "  ✔ 新增：$file"
    continue
  fi

  # 两边都有，选“内容更长”或“时间更新”的一方
  if [[ $(stat -c %Y "$src") -gt $(stat -c %Y "$dest") ]] || [[ $(wc -c <"$src") -gt $(wc -c <"$dest") ]]; then
    mv "$src" "$dest"
    echo "  ✔ 更新：$file （src 更新或更长）"
  else
    rm "$src"
    echo "  ✔ 保留：$file （dest 更新或更长）"
  fi
done

# 3. 删除空掉的 docs/docs
rmdir docs/docs 2>/dev/null || true

# 4. 自动提交
echo "📤 提交更改 ..."
git add docs/
git commit -m "chore: merge docs/docs into docs, keep latest & richest info"

# 5. 推送到 GitHub（当前分支）
current_branch=$(git branch --show-current)
echo "🚀 推送到远程分支：$current_branch"
git push origin "$current_branch"

echo "✅ 全部完成！"
