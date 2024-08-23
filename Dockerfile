FROM node:20.12.1-alpine3.19

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    wqy-zenhei

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser


# アプリケーションの作業ディレクトリを作成
WORKDIR /usr/src/app

# 依存関係のインストール
COPY package*.json ./
RUN npm install

EXPOSE 3000

# 環境変数
COPY .env ./

# ソースコード
COPY index.js ./