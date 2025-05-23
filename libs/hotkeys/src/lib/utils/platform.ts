export type Platform = 'apple' | 'pc';

export function hostPlatform(): Platform {
  const appleDevices = ['Mac', 'iPhone', 'iPad'];
  return appleDevices.some((d) => navigator.userAgent.includes(d)) ? 'apple' : 'pc';
}

export function normalizeKeys(keys: string, platform: Platform): string {
  const transformMap: Record<string, string> = {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
  };

  function transform(key: string): string {
    if (platform === 'pc' && key === 'meta') {
      key = 'control';
    }

    if (key in transformMap) {
      key = transformMap[key];
    }

    return key;
  }

  return keys
    .toLowerCase()
    .split('>')
    .map((s) => s.split('.').map(transform).join('.'))
    .join('>');
}
