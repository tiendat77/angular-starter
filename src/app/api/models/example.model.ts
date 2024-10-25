import { BaseEntityModel } from './entity.base';

/**
 * API entity
 * @extends BaseEntityModel
 */
export interface ExampleEntityModel extends BaseEntityModel {
  example: string;
}

/**
 * Extends entity with additional properties
 * @extends ExampleEntityModel
 */
export interface ExampleModel extends ExampleEntityModel {
  extra: string;
}
