import { ENVIRONMENT_INITIALIZER, inject } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { IconsService } from './icons.service';
import { ICON_NAMESPACES } from './icon.token';
export const provideIcons = (namespaces = []) => {
    return [
        provideHttpClient(),
        {
            provide: ICON_NAMESPACES,
            useValue: namespaces,
        },
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => inject(IconsService),
            multi: true,
        },
    ];
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbnMucHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2ljb25zLnByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSx1QkFBdUIsRUFBd0IsTUFBTSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ2hHLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRXpELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRy9DLE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxDQUMxQixhQUE4QixFQUFFLEVBQ0ssRUFBRTtJQUN2QyxPQUFPO1FBQ0wsaUJBQWlCLEVBQUU7UUFDbkI7WUFDRSxPQUFPLEVBQUUsZUFBZTtZQUN4QixRQUFRLEVBQUUsVUFBVTtTQUNyQjtRQUNEO1lBQ0UsT0FBTyxFQUFFLHVCQUF1QjtZQUNoQyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztZQUNwQyxLQUFLLEVBQUUsSUFBSTtTQUNaO0tBQ0YsQ0FBQztBQUNKLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVOVklST05NRU5UX0lOSVRJQUxJWkVSLCBFbnZpcm9ubWVudFByb3ZpZGVycywgaW5qZWN0LCBQcm92aWRlciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgcHJvdmlkZUh0dHBDbGllbnQgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5cbmltcG9ydCB7IEljb25zU2VydmljZSB9IGZyb20gJy4vaWNvbnMuc2VydmljZSc7XG5pbXBvcnQgeyBJQ09OX05BTUVTUEFDRVMgfSBmcm9tICcuL2ljb24udG9rZW4nO1xuaW1wb3J0IHsgSWNvbk5hbWVzcGFjZSB9IGZyb20gJy4vaWNvbi5pbnRlcmZhY2UnO1xuXG5leHBvcnQgY29uc3QgcHJvdmlkZUljb25zID0gKFxuICBuYW1lc3BhY2VzOiBJY29uTmFtZXNwYWNlW10gPSBbXVxuKTogKFByb3ZpZGVyIHwgRW52aXJvbm1lbnRQcm92aWRlcnMpW10gPT4ge1xuICByZXR1cm4gW1xuICAgIHByb3ZpZGVIdHRwQ2xpZW50KCksXG4gICAge1xuICAgICAgcHJvdmlkZTogSUNPTl9OQU1FU1BBQ0VTLFxuICAgICAgdXNlVmFsdWU6IG5hbWVzcGFjZXMsXG4gICAgfSxcbiAgICB7XG4gICAgICBwcm92aWRlOiBFTlZJUk9OTUVOVF9JTklUSUFMSVpFUixcbiAgICAgIHVzZVZhbHVlOiAoKSA9PiBpbmplY3QoSWNvbnNTZXJ2aWNlKSxcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgIH0sXG4gIF07XG59O1xuIl19