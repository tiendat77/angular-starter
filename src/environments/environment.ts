import packageJson from '../../package.json';

export const environment: Environment = {
  version: packageJson.version,
  apiUrl: 'http://localhost:3000/api',
};
