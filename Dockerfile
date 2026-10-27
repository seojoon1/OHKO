# Node 24.22.1 이상: 2026-10-21 보안 업데이트(CVE-2026-111497 Brotli RCE 등) 반영 버전
FROM node:24.22.1-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:24.22.1-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:24.22.1-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:24.22.1-alpine
# root 대신 이미지에 있는 node 사용자로 실행한다. 파일은 root 소유로 두어 앱이 읽기만 할 수 있다.
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
USER node
CMD ["npm", "run", "start"]
