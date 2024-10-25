export interface BaseEntityModel {
  id: string;
  isActive?: boolean;
  isDelete?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;

  [key: string]: unknown;
}
