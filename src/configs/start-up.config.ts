import { of } from 'rxjs';

/**
 * @description Start up function - This is useful for any initial setup that needs to be done before the application starts
 * @returns Observable
 */
export const startUpFn = () => {
  return () => of({});
};

export default startUpFn;
