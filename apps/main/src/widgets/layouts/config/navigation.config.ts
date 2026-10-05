import { PERMISSION } from '@/shared/config/permission.config';
import { NavigationItem } from '@libs/navigation';

export const NAVIGATION: NavigationItem[] = [
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
        id: 'dashboard.products',
        title: 'Product Management',
        type: 'basic',
        icon: 'heroicons_outline:shopping-bag',
        link: '/app/example/products',
      },
    ],
  },
];
