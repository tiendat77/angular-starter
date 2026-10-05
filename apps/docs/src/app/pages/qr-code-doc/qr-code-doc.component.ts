import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiQrCode, UiQrCodeLevel, UiQrCodeStatus, UiQrCodeType } from '@libs/ui/qr-code';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

const LOGO_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#18181b"/><path d="M14 24l7 7 13-17" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** Seconds a demo code stays valid. */
const CODE_LIFETIME = 15;

@Component({
  selector: 'doc-qr-code',
  imports: [FormsModule, UiQrCode, PlaygroundComponent, ApiTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './qr-code-doc.component.html',
})
export class QrCodeDocComponent {
  readonly logo = `data:image/svg+xml;utf8,${encodeURIComponent(LOGO_SVG)}`;

  // Playground
  readonly value = signal('https://angular.dev');
  readonly size = signal(160);
  readonly color = signal('#000000');
  readonly bgColor = signal('#ffffff');
  readonly level = signal<UiQrCodeLevel>('M');
  readonly type = signal<UiQrCodeType>('canvas');
  readonly status = signal<UiQrCodeStatus>('active');
  readonly withIcon = signal(false);
  readonly iconSize = signal(40);
  readonly bordered = signal(true);

  // Expiring code
  readonly token = signal(newToken());
  readonly remaining = signal(CODE_LIFETIME);
  readonly refreshing = signal(false);
  readonly expiringStatus = computed<UiQrCodeStatus>(() => {
    if (this.refreshing()) return 'loading';
    return this.remaining() > 0 ? 'active' : 'expired';
  });
  readonly expiringValue = computed(() => `https://example.com/pay?token=${this.token()}`);

  constructor() {
    const timer = setInterval(() => {
      if (!this.refreshing() && this.remaining() > 0) {
        this.remaining.update((seconds) => seconds - 1);
      }
    }, 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  /** What a real app does on `(refresh)`: ask the backend for a new code, then show it. */
  onRefresh(): void {
    this.refreshing.set(true);
    setTimeout(() => {
      this.token.set(newToken());
      this.remaining.set(CODE_LIFETIME);
      this.refreshing.set(false);
    }, 1200);
  }

  readonly generatedCode = computed(() => {
    const attrs = [`value="${this.value()}"`];
    if (this.size() !== 160) attrs.push(`[size]="${this.size()}"`);
    if (this.color() !== '#000000') attrs.push(`color="${this.color()}"`);
    if (this.bgColor() !== '#ffffff') attrs.push(`bgColor="${this.bgColor()}"`);
    if (this.level() !== 'M') attrs.push(`level="${this.level()}"`);
    if (this.type() !== 'canvas') attrs.push(`type="${this.type()}"`);
    if (this.withIcon()) {
      attrs.push('icon="/assets/logo.svg"');
      if (this.iconSize() !== 40) attrs.push(`[iconSize]="${this.iconSize()}"`);
    }
    if (this.status() !== 'active') attrs.push(`status="${this.status()}"`);
    if (!this.bordered()) attrs.push('[bordered]="false"');
    return `<ui-qr-code\n  ${attrs.join('\n  ')}\n/>`;
  });

  readonly expiringCode = `<ui-qr-code
  [value]="url()"
  [status]="status()"
  (refresh)="reload()"
/>

status = computed(() => (this.loading() ? 'loading' : this.expired() ? 'expired' : 'active'));

reload(): void {
  this.loading.set(true);
  this.api.newToken().subscribe((token) => {
    this.token.set(token);
    this.loading.set(false);
  });
}`;

  readonly apiRows: ApiRow[] = [
    { name: 'value', type: 'string', description: 'Text or URL to encode. Required.' },
    {
      name: 'size',
      type: 'number',
      default: '160',
      description:
        'Side of the drawn code in px. The frame adds its 12px padding (the quiet zone) and border.',
    },
    {
      name: 'color',
      type: 'string',
      default: "'#000000'",
      description:
        'Foreground color. A literal CSS color: canvas cannot resolve var() or currentColor.',
    },
    {
      name: 'bgColor',
      type: 'string',
      default: "'#FFFFFF'",
      description: 'Background color; it also fills the frame so the quiet zone matches.',
    },
    {
      name: 'level',
      type: "'L' | 'M' | 'Q' | 'H'",
      default: "'M'",
      description:
        'Minimum error correction (about 7%, 15%, 25%, 30%). Raised automatically when that costs no extra size.',
    },
    {
      name: 'type',
      type: "'canvas' | 'svg'",
      default: "'canvas'",
      description:
        'Render engine. Canvas draws after render (never on the server); SVG renders anywhere.',
    },
    {
      name: 'icon',
      type: 'string',
      description: 'Image URL or data URI drawn in the middle. The modules behind it are cleared.',
    },
    { name: 'iconSize', type: 'number', default: '40', description: 'Side of the icon in px.' },
    {
      name: 'status',
      type: "'active' | 'loading' | 'expired' | 'scanned'",
      default: "'active'",
      description: 'Anything but active covers the code with an overlay.',
    },
    { name: 'bordered', type: 'boolean', default: 'true', description: 'Draws the frame border.' },
    {
      name: 'labels',
      type: 'Partial<{ qrCode, loading, expired, scanned, refresh }>',
      default: 'English',
      description: 'Overrides the texts (also the way to localise them).',
    },
    {
      name: 'ariaLabel',
      type: 'string',
      default: 'derived',
      description:
        'Replaces the accessible name: "QR code: <value>" while active, "QR code (<status>)" otherwise.',
    },
    {
      name: '(refresh)',
      type: 'void',
      description: 'Emitted when the Refresh button on the expired overlay is clicked.',
    },
  ];
}

function newToken(): string {
  return Math.random().toString(36).slice(2, 10);
}
