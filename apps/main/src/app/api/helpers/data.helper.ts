import { isNil } from 'es-toolkit';

interface JsonPatchOperation {
  op: string;
  path: string;
  value: any;
}

export class DataHelper {
  static toJsonPatch(data: Record<string, any>): JsonPatchOperation[] {
    return Object.entries(data).map(([key, value]) => ({
      op: 'replace',
      path: `/${key}`,
      value: value,
    }));
  }

  static toSearchParams(data: Record<string, any>): URLSearchParams {
    const params = new URLSearchParams();

    for (const key in data) {
      let value = data[key];
      if (isNil(value) || value === '') {
        continue;
      }

      if (key === 'sortOrder') {
        const sortOrderMap: Record<string, string> = {
          ascend: 'asc',
          descend: 'desc',
        };

        value = sortOrderMap[value] || null;
      }

      params.append(key, value.toString());
    }

    return params;
  }

  static trim(obj: any) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    for (const key in obj) {
      const value = obj[key];

      if (typeof value === 'string') {
        obj[key] = value.trim();
        continue;
      }

      // Recursive for nested objects/arrays
      if (typeof value === 'object') {
        DataHelper.trim(value);
      }
    }

    return obj;
  }
}
