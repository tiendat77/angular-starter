import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import {
  addEntity,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { lastValueFrom } from 'rxjs';

import { ComponentState } from '@models';
import { ExampleModel } from '../../api/models';
import { ExampleAPIService } from '../../api/resources/example';

export type ExampleEntity = ExampleModel & { id: string };

export const ExampleStore = signalStore(
  { providedIn: 'root' },
  withState({
    state: 'idle' as ComponentState,
    error: null as string | null,
  }),
  withEntities<ExampleEntity>(),
  withMethods((store, exampleApiService = inject(ExampleAPIService)) => ({
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    async loadAll() {
      patchState(store, { state: 'loading', error: null });
      try {
        const list = await lastValueFrom(exampleApiService.list());
        // Map the list to ensure id is string (not null/undefined) for entity state
        const entities: ExampleEntity[] = list.map((item) => ({
          ...item,
          id: item.id || crypto.randomUUID(),
        })) as ExampleEntity[];
        patchState(store, setAllEntities(entities));
        patchState(store, { state: entities.length > 0 ? 'loaded' : 'empty' });
      } catch (err: any) {
        patchState(store, { state: 'error', error: err.message || 'Failed to load examples' });
      }
    },

    async create(data: Partial<ExampleModel>) {
      patchState(store, { state: 'loading', error: null });
      try {
        const id = await lastValueFrom(exampleApiService.create(data));
        const newEntity: ExampleEntity = {
          ...data,
          id,
        } as ExampleEntity;
        patchState(store, addEntity(newEntity), { state: 'loaded' });
        return newEntity;
      } catch (err: any) {
        patchState(store, { state: 'error', error: err.message || 'Failed to create example' });
        throw err;
      }
    },

    async update(id: string, data: Partial<ExampleModel>) {
      patchState(store, { state: 'loading', error: null });
      try {
        await lastValueFrom(exampleApiService.update(id, data));
        patchState(
          store,
          updateEntity({
            id,
            changes: data as Partial<ExampleEntity>,
          }),
          { state: 'loaded' }
        );
      } catch (err: any) {
        patchState(store, { state: 'error', error: err.message || 'Failed to update example' });
        throw err;
      }
    },

    async delete(id: string) {
      patchState(store, { state: 'loading', error: null });
      try {
        await lastValueFrom(exampleApiService.delete(id));
        patchState(store, removeEntity(id));
        patchState(store, { state: store.ids().length > 0 ? 'loaded' : 'empty' });
      } catch (err: any) {
        patchState(store, { state: 'error', error: err.message || 'Failed to delete example' });
        throw err;
      }
    },
  }))
);
