import packageJson from '../../package.json';

export const environment: Environment = {
  version: packageJson.version,
  apiUrl: 'https://api.angular-starter.com/api',
};
