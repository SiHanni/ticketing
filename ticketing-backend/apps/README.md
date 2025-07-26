### 서비스별 실행방법

- root 에서 pnpm install
- libs 빌드 : pnpm run build:libs
- 서비스별 빌드 : pnpm --filter user-service build
- 서비스별 서버 시작 : pnpm --filter user-service start
