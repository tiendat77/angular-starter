import { NavigationItem } from '@libs/navigation';
import { PERMISSION } from './permission.config';

export const navigation: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Example',
    subtitle: 'Where the magic happens',
    type: 'group',
    icon: 'heroicons_outline:beaker',
    permissions: [PERMISSION.OVERVIEW],
    children: [
      {
        id: 'dashboard.welcome',
        title: 'Welcome',
        type: 'basic',
        icon: 'heroicons_outline:bolt',
        link: '/app/example/welcome',
      },
      {
        id: 'dashboard.aria',
        title: 'ARIA',
        type: 'basic',
        icon: 'heroicons_outline:sparkles',
        link: '/app/example/aria',
      },
    ],
  },
];
