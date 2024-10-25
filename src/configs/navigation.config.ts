import { NavigationItem } from '@libs/navigation';

export const navigation: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Overview',
    subtitle: 'Where the magic happens',
    type: 'group',
    icon: 'heroicons_outline:home',
    children: [
      {
        id: 'dashboard.overview',
        title: 'Overview',
        type: 'basic',
        icon: 'heroicons_outline:bolt',
        link: '/app/overview',
      },
    ],
  },
];
