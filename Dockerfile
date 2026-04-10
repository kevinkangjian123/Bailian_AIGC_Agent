# 使用 Node.js 20 官方镜像
FROM node:20-slim

# 设置工作目录
WORKDIR /app

# 首先只复制 package.json 和 lock 文件，利用 Docker 缓存层优化安装速度
COPY package*.json ./

# 安装所有依赖
RUN npm install

# 复制项目所有文件
COPY . .

# 构建前端静态资源
RUN npm run build

# 暴露端口 3000
EXPOSE 3000

# 设置生产环境环境变量
ENV NODE_ENV=production

# 启动应用
# 注意：我们在 package.json 中已经定义了 start 脚本使用 tsx 运行 server.ts
CMD ["npm", "start"]
