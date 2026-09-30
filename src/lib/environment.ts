export const isDevelopmentDeployment = () =>
  process.env.NEXT_PUBLIC_DEPLOY_ENV === 'development';
