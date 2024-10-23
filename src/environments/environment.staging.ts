import packageJson from '../../package.json';

export const environment: Environment = {
  version: packageJson.version,
  apiUrl: 'http://192.168.1.194:3000/api',
};
