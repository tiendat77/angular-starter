import { NavigationItem } from '@libs/navigation';

export const NAVIGATION: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Example',
    subtitle: 'Where the magic happens',
    type: 'group',
    icon: 'heroicons_outline:beaker',
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

  /**
   * Navigation demo. Everything below links to fake routes (they land on the not-found page);
   * it only exists to show each item type the vertical navigation supports.
   */
  { id: 'demo.divider', type: 'divider' },
  {
    id: 'demo',
    title: 'Navigation demo',
    subtitle: 'Every item type',
    type: 'group',
    icon: 'heroicons_outline:squares-2x2',
    children: [
      // basic: plain link, with a badge
      {
        id: 'demo.inbox',
        title: 'Inbox',
        type: 'basic',
        icon: 'heroicons_outline:inbox',
        link: '/app/demo/inbox',
        badge: { title: '12', classes: 'bg-primary text-primary-content' },
      },
      // basic: disabled
      {
        id: 'demo.archive',
        title: 'Archive (disabled)',
        type: 'basic',
        icon: 'heroicons_outline:archive-box',
        link: '/app/demo/archive',
        disabled: true,
      },
      // basic: external link
      {
        id: 'demo.docs',
        title: 'Angular docs',
        type: 'basic',
        icon: 'heroicons_outline:arrow-top-right-on-square',
        link: 'https://angular.dev',
        externalLink: true,
        target: '_blank',
      },
      // basic: runs a function instead of navigating
      {
        id: 'demo.print',
        title: 'Print this page',
        type: 'basic',
        icon: 'heroicons_outline:document-text',
        function: () => window.print(),
      },

      // collapsable: with a nested collapsable
      {
        id: 'demo.catalog',
        title: 'Catalog',
        type: 'collapsable',
        icon: 'heroicons_outline:shopping-cart',
        children: [
          {
            id: 'demo.catalog.all',
            title: 'All products',
            type: 'basic',
            link: '/app/demo/catalog/all',
          },
          {
            id: 'demo.catalog.categories',
            title: 'Categories',
            type: 'collapsable',
            children: [
              {
                id: 'demo.catalog.categories.clothing',
                title: 'Clothing',
                type: 'basic',
                link: '/app/demo/catalog/categories/clothing',
              },
              {
                id: 'demo.catalog.categories.shoes',
                title: 'Shoes',
                type: 'basic',
                link: '/app/demo/catalog/categories/shoes',
                badge: { title: 'New', classes: 'bg-success text-success-content' },
              },
              {
                id: 'demo.catalog.categories.accessories',
                title: 'Accessories',
                type: 'basic',
                link: '/app/demo/catalog/categories/accessories',
              },
            ],
          },
          {
            id: 'demo.catalog.brands',
            title: 'Brands',
            type: 'basic',
            link: '/app/demo/catalog/brands',
          },
        ],
      },

      // collapsable: with a divider, a group and a disabled child
      {
        id: 'demo.settings',
        title: 'Settings',
        type: 'collapsable',
        icon: 'heroicons_outline:cog-6-tooth',
        children: [
          {
            id: 'demo.settings.profile',
            title: 'Profile',
            type: 'basic',
            link: '/app/demo/settings/profile',
          },
          {
            id: 'demo.settings.security',
            title: 'Security',
            type: 'basic',
            link: '/app/demo/settings/security',
          },
          { id: 'demo.settings.divider', type: 'divider' },
          {
            id: 'demo.settings.billing',
            title: 'Billing',
            subtitle: 'Plans and invoices',
            type: 'group',
            children: [
              {
                id: 'demo.settings.billing.plan',
                title: 'Plan',
                type: 'basic',
                link: '/app/demo/settings/billing/plan',
              },
              {
                id: 'demo.settings.billing.invoices',
                title: 'Invoices',
                type: 'basic',
                link: '/app/demo/settings/billing/invoices',
              },
            ],
          },
          {
            id: 'demo.settings.danger',
            title: 'Danger zone (disabled)',
            type: 'basic',
            link: '/app/demo/settings/danger',
            disabled: true,
          },
        ],
      },

      // spacer: vertical gap between items
      { id: 'demo.spacer', type: 'spacer' },

      // collapsable: first level only, e.g. reports
      {
        id: 'demo.reports',
        title: 'Reports',
        type: 'collapsable',
        icon: 'heroicons_outline:chart-bar',
        children: [
          {
            id: 'demo.reports.sales',
            title: 'Sales',
            type: 'basic',
            link: '/app/demo/reports/sales',
          },
          {
            id: 'demo.reports.traffic',
            title: 'Traffic',
            type: 'basic',
            link: '/app/demo/reports/traffic',
          },
        ],
      },
    ],
  },

  // aside: top level only; clicking opens its children in a side panel
  {
    id: 'demo.workspace',
    title: 'Workspace',
    subtitle: 'Opens in an aside panel',
    type: 'aside',
    icon: 'heroicons_outline:user-group',
    children: [
      {
        id: 'demo.workspace.members',
        title: 'Members',
        type: 'basic',
        icon: 'heroicons_outline:users',
        link: '/app/demo/workspace/members',
      },
      {
        id: 'demo.workspace.projects',
        title: 'Projects',
        type: 'collapsable',
        icon: 'heroicons_outline:folder',
        children: [
          {
            id: 'demo.workspace.projects.active',
            title: 'Active',
            type: 'basic',
            link: '/app/demo/workspace/projects/active',
          },
          {
            id: 'demo.workspace.projects.archived',
            title: 'Archived',
            type: 'basic',
            link: '/app/demo/workspace/projects/archived',
          },
        ],
      },
    ],
  },
];
