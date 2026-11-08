FROM node:22-alpine
WORKDIR /app
COPY package.json server.js index.html privacy.html terms.html ./
COPY assets ./assets
ENV NODE_ENV=production
USER node
CMD ["node", "server.js"]
