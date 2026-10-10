export const isDevelopmentDeployment = () =>
  process.env.NEXT_PUBLIC_DEPLOY_ENV === 'development';

// 개발 배포도 NODE_ENV=production으로 빌드되므로 배포 환경 값으로 운영을 판정한다.
// 값이 없는 프리뷰·로컬은 운영이 아니다.
export const isProductionDeployment = () =>
  process.env.NEXT_PUBLIC_DEPLOY_ENV === 'production';
