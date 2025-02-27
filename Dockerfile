# 빌드 스테이지: 소스 코드를 컴파일하고 애플리케이션을 빌드하는 단계
FROM node:22-alpine AS build
WORKDIR /usr/src/app

# 필요한 빌드 도구 설치 (C++ 컴파일러 등이 필요한 패키지를 위해)
RUN apk add --no-cache python3 make g++ git
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .

# Next.js 애플리케이션 빌드 실행
RUN yarn build

# 프로덕션 스테이지: 실행에 필요한 최소한의 파일만 포함하는 경량화된 이미지
FROM node:22-alpine AS production
WORKDIR /usr/src/app

# 이미지 최적화 라이브러리(sharp)에 필요한 시스템 의존성 설치
RUN apk add --no-cache vips-dev

# 빌드된 standalone 애플리케이션만 복사 (최적화된 서버 코드)
COPY --from=build /usr/src/app/.next/standalone ./
COPY --from=build /usr/src/app/.next/static ./.next/static
COPY --from=build /usr/src/app/public ./public
COPY --from=build /usr/src/app/node_modules ./node_modules

# Next.js 이미지 최적화에 필수적인 sharp 라이브러리 설치
RUN yarn add sharp
EXPOSE 3000
CMD ["node", "server.js"]
