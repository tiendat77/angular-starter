export interface ColumnModel {
  id: string;
  name: string;
  key: string;
  sortable?: boolean;
  type?: 'string' | 'number' | 'currency' | 'date' | 'percent' | 'boolean' | 'image';
  colspan?: number;
  [key: string]: any;
}
