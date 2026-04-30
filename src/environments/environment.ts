import packageJson from '../../package.json';

export const environment = {
  version: packageJson.version,
  apiUrl: window['env']?.API_URL || 'http://localhost:3000/api',
};
