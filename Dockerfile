# —— 第一阶段：构建生产包 ——
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --force
COPY . .
RUN npm run build   # 生成 dist

# —— 第二阶段：用最小的 nginx 伺服静态文件 ——
FROM nginx:alpine
# 复制我们自己的 nginx 配置（解决 React Router 刷新 404）
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf
# 复制打包好的 dist
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
