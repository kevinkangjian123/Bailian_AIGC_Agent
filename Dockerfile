# 使用 Node.js 20.12.2 官方完整镜像，确保构建环境具备所有必要的库且版本稳定
FROM node:20.12.2

# 设置工作目录
WORKDIR /app

# 首先只复制 package.json 和 lock 文件，利用 Docker 缓存层优化安装速度
# 使用 npm ci 确保安装的版本与 package-lock.json 完全一致
COPY package*.json ./
RUN npm ci

# 复制项目所有文件
COPY . .

# 构建前端静态资源
# 增加内存限制以防构建过程中内存溢出
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# 暴露端口 3000
EXPOSE 3000

# 设置生产环境环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["npm", "start"]
