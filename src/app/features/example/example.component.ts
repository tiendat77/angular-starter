import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WelcomeComponent } from './welcome/welcome.component';

import { DialogService } from '@libs/dialog';
import { LoaderService } from '@libs/loader';
import { ToastService } from '@libs/toast';
import { SvgIcon } from '@libs/svg-icon';
import { NavigationItem, VerticalNavigationComponent } from '@libs/navigation';

import { ExampleDialogComponent } from './example-dialog/example-dialog.component';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [WelcomeComponent, SvgIcon, VerticalNavigationComponent],
  templateUrl: './example.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent {
  navigation: NavigationItem[] = [
    {
      id: 'dashboards',
      title: 'Dashboards',
      subtitle: 'Unique dashboard designs',
      type: 'group',
      icon: 'heroicons_outline:home',
      children: [
        {
          id: 'dashboards.project',
          title: 'Project',
          type: 'basic',
          link: '/example',
          icon: 'heroicons_outline:clipboard-document-check',
        },
        {
          id: 'dashboards.analytics',
          title: 'Analytics',
          type: 'basic',
          link: '/example',
          icon: 'heroicons_outline:chart-pie',
        },
        {
          id: 'dashboards.finance',
          title: 'Finance',
          type: 'basic',
          icon: 'heroicons_outline:banknotes',
        },
        {
          id: 'dashboards.crypto',
          title: 'Crypto',
          type: 'basic',
          icon: 'heroicons_outline:currency-dollar',
        },
      ],
    },
    {
      id: 'apps',
      title: 'Applications',
      subtitle: 'Custom made application designs',
      type: 'group',
      icon: 'heroicons_outline:home',
      children: [
        {
          id: 'apps.academy',
          title: 'Academy',
          type: 'basic',
          icon: 'heroicons_outline:academic-cap',
        },
        {
          id: 'apps.chat',
          title: 'Chat',
          type: 'basic',
          icon: 'heroicons_outline:chat-bubble-bottom-center-text',
        },
        {
          id: 'apps.contacts',
          title: 'Contacts',
          type: 'basic',
          icon: 'heroicons_outline:user-group',
        },
        {
          id: 'apps.ecommerce',
          title: 'ECommerce',
          type: 'collapsable',
          icon: 'heroicons_outline:shopping-cart',
          children: [
            {
              id: 'apps.ecommerce.inventory',
              title: 'Inventory',
              type: 'basic',
            },
          ],
        },
        {
          id: 'apps.file-manager',
          title: 'File Manager',
          type: 'basic',
          icon: 'heroicons_outline:cloud',
        },
        {
          id: 'apps.help-center',
          title: 'Help Center',
          type: 'collapsable',
          icon: 'heroicons_outline:information-circle',
          children: [
            {
              id: 'apps.help-center.home',
              title: 'Home',
              type: 'basic',
              exactMatch: true,
            },
            {
              id: 'apps.help-center.faqs',
              title: 'FAQs',
              type: 'basic',
            },
            {
              id: 'apps.help-center.guides',
              title: 'Guides',
              type: 'basic',
            },
            {
              id: 'apps.help-center.support',
              title: 'Support',
              type: 'basic',
            },
          ],
        },
        {
          id: 'apps.mailbox',
          title: 'Mailbox',
          type: 'basic',
          icon: 'heroicons_outline:envelope',
          badge: {
            title: '27',
            classes: 'px-2 bg-pink-600 text-white rounded-full',
          },
        },
        {
          id: 'apps.notes',
          title: 'Notes',
          type: 'basic',
          icon: 'heroicons_outline:pencil-square',
        },
        {
          id: 'apps.scrumboard',
          title: 'Scrumboard',
          type: 'basic',
          icon: 'heroicons_outline:view-columns',
        },
        {
          id: 'apps.tasks',
          title: 'Tasks',
          type: 'basic',
          icon: 'heroicons_outline:check-circle',
        },
      ],
    },
    {
      id: 'pages',
      title: 'Pages',
      subtitle: 'Custom made page designs',
      type: 'group',
      icon: 'heroicons_outline:document',
      children: [
        {
          id: 'pages.activities',
          title: 'Activities',
          type: 'basic',
          icon: 'heroicons_outline:bars-3-bottom-left',
        },
        {
          id: 'pages.authentication',
          title: 'Authentication',
          type: 'collapsable',
          icon: 'heroicons_outline:lock-closed',
          children: [
            {
              id: 'pages.authentication.sign-in',
              title: 'Sign in',
              type: 'collapsable',
              children: [
                {
                  id: 'pages.authentication.sign-in.classic',
                  title: 'Classic',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.sign-in.modern',
                  title: 'Modern',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.sign-in.modern-reversed',
                  title: 'Modern Reversed',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.sign-in.split-screen',
                  title: 'Split Screen',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.sign-in.split-screen-reversed',
                  title: 'Split Screen Reversed',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.sign-in.fullscreen',
                  title: 'Fullscreen',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.sign-in.fullscreen-reversed',
                  title: 'Fullscreen Reversed',
                  type: 'basic',
                },
              ],
            },
            {
              id: 'pages.authentication.sign-up',
              title: 'Sign up',
              type: 'collapsable',
              children: [
                {
                  id: 'pages.authentication.sign-up.classic',
                  title: 'Classic',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.sign-up.modern',
                  title: 'Modern',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.sign-up.modern-reversed',
                  title: 'Modern Reversed',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.sign-up.split-screen',
                  title: 'Split Screen',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.sign-up.split-screen-reversed',
                  title: 'Split Screen Reversed',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.sign-up.fullscreen',
                  title: 'Fullscreen',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.sign-up.fullscreen-reversed',
                  title: 'Fullscreen Reversed',
                  type: 'basic',
                },
              ],
            },
            {
              id: 'pages.authentication.sign-out',
              title: 'Sign out',
              type: 'collapsable',
              children: [
                {
                  id: 'pages.authentication.sign-out.classic',
                  title: 'Classic',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.sign-out.modern',
                  title: 'Modern',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.sign-out.modern-reversed',
                  title: 'Modern Reversed',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.sign-out.split-screen',
                  title: 'Split Screen',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.sign-out.split-screen-reversed',
                  title: 'Split Screen Reversed',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.sign-out.fullscreen',
                  title: 'Fullscreen',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.sign-out.fullscreen-reversed',
                  title: 'Fullscreen Reversed',
                  type: 'basic',
                },
              ],
            },
            {
              id: 'pages.authentication.forgot-password',
              title: 'Forgot password',
              type: 'collapsable',
              children: [
                {
                  id: 'pages.authentication.forgot-password.classic',
                  title: 'Classic',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.forgot-password.modern',
                  title: 'Modern',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.forgot-password.modern-reversed',
                  title: 'Modern Reversed',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.forgot-password.split-screen',
                  title: 'Split Screen',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.forgot-password.split-screen-reversed',
                  title: 'Split Screen Reversed',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.forgot-password.fullscreen',
                  title: 'Fullscreen',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.forgot-password.fullscreen-reversed',
                  title: 'Fullscreen Reversed',
                  type: 'basic',
                },
              ],
            },
            {
              id: 'pages.authentication.reset-password',
              title: 'Reset password',
              type: 'collapsable',
              children: [
                {
                  id: 'pages.authentication.reset-password.classic',
                  title: 'Classic',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.reset-password.modern',
                  title: 'Modern',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.reset-password.modern-reversed',
                  title: 'Modern Reversed',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.reset-password.split-screen',
                  title: 'Split Screen',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.reset-password.split-screen-reversed',
                  title: 'Split Screen Reversed',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.reset-password.fullscreen',
                  title: 'Fullscreen',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.reset-password.fullscreen-reversed',
                  title: 'Fullscreen Reversed',
                  type: 'basic',
                },
              ],
            },
            {
              id: 'pages.authentication.unlock-session',
              title: 'Unlock session',
              type: 'collapsable',
              children: [
                {
                  id: 'pages.authentication.unlock-session.classic',
                  title: 'Classic',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.unlock-session.modern',
                  title: 'Modern',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.unlock-session.modern-reversed',
                  title: 'Modern Reversed',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.unlock-session.split-screen',
                  title: 'Split Screen',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.unlock-session.split-screen-reversed',
                  title: 'Split Screen Reversed',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.unlock-session.fullscreen',
                  title: 'Fullscreen',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.unlock-session.fullscreen-reversed',
                  title: 'Fullscreen Reversed',
                  type: 'basic',
                },
              ],
            },
            {
              id: 'pages.authentication.confirmation-required',
              title: 'Confirmation required',
              type: 'collapsable',
              children: [
                {
                  id: 'pages.authentication.confirmation-required.classic',
                  title: 'Classic',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.confirmation-required.modern',
                  title: 'Modern',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.confirmation-required.modern-reversed',
                  title: 'Modern Reversed',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.confirmation-required.split-screen',
                  title: 'Split Screen',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.confirmation-required.split-screen-reversed',
                  title: 'Split Screen Reversed',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.confirmation-required.fullscreen',
                  title: 'Fullscreen',
                  type: 'basic',
                },
                {
                  id: 'pages.authentication.confirmation-required.fullscreen-reversed',
                  title: 'Fullscreen Reversed',
                  type: 'basic',
                },
              ],
            },
          ],
        },
        {
          id: 'pages.coming-soon',
          title: 'Coming Soon',
          type: 'collapsable',
          icon: 'heroicons_outline:clock',
          children: [
            {
              id: 'pages.coming-soon.classic',
              title: 'Classic',
              type: 'basic',
            },
            {
              id: 'pages.coming-soon.modern',
              title: 'Modern',
              type: 'basic',
            },
            {
              id: 'pages.coming-soon.modern-reversed',
              title: 'Modern Reversed',
              type: 'basic',
            },
            {
              id: 'pages.coming-soon.split-screen',
              title: 'Split Screen',
              type: 'basic',
            },
            {
              id: 'pages.coming-soon.split-screen-reversed',
              title: 'Split Screen Reversed',
              type: 'basic',
            },
            {
              id: 'pages.coming-soon.fullscreen',
              title: 'Fullscreen',
              type: 'basic',
            },
            {
              id: 'pages.coming-soon.fullscreen-reversed',
              title: 'Fullscreen Reversed',
              type: 'basic',
            },
          ],
        },
        {
          id: 'pages.error',
          title: 'Error',
          type: 'collapsable',
          icon: 'heroicons_outline:exclamation-circle',
          children: [
            {
              id: 'pages.error.404',
              title: '404',
              type: 'basic',
            },
            {
              id: 'pages.error.500',
              title: '500',
              type: 'basic',
            },
          ],
        },
        {
          id: 'pages.invoice',
          title: 'Invoice',
          type: 'collapsable',
          icon: 'heroicons_outline:calculator',
          children: [
            {
              id: 'pages.invoice.printable',
              title: 'Printable',
              type: 'collapsable',
              children: [
                {
                  id: 'pages.invoice.printable.compact',
                  title: 'Compact',
                  type: 'basic',
                },
                {
                  id: 'pages.invoice.printable.modern',
                  title: 'Modern',
                  type: 'basic',
                },
              ],
            },
          ],
        },
        {
          id: 'pages.maintenance',
          title: 'Maintenance',
          type: 'basic',
          icon: 'heroicons_outline:exclamation-triangle',
        },
        {
          id: 'pages.pricing',
          title: 'Pricing',
          type: 'collapsable',
          icon: 'heroicons_outline:banknotes',
          children: [
            {
              id: 'pages.pricing.modern',
              title: 'Modern',
              type: 'basic',
            },
            {
              id: 'pages.pricing.simple',
              title: 'Simple',
              type: 'basic',
            },
            {
              id: 'pages.pricing.single',
              title: 'Single',
              type: 'basic',
            },
            {
              id: 'pages.pricing.table',
              title: 'Table',
              type: 'basic',
            },
          ],
        },
        {
          id: 'pages.profile',
          title: 'Profile',
          type: 'basic',
          icon: 'heroicons_outline:user-circle',
        },
        {
          id: 'pages.settings',
          title: 'Settings',
          type: 'basic',
          icon: 'heroicons_outline:cog-8-tooth',
        },
      ],
    },
  ];

  protected _dialog = inject(DialogService);
  protected _loader = inject(LoaderService);
  protected _toast = inject(ToastService);

  openDialog() {
    this._dialog.open(ExampleDialogComponent, {
      width: '600px',
      data: {
        message: 'Hello World',
      },
    });
  }

  openLoader() {
    this._loader.show();

    setTimeout(() => {
      this._loader.hide();
    }, 3000);
  }

  openToast() {
    this._toast.warning('Message: Lorem ipsum dolor sit amet', 'Hello World');
  }
}
