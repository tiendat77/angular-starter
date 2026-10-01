import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiAvatarComponent, UiAvatarGroupComponent, UiAvatarShape } from '@libs/ui/avatar';
import { UiBadgeAnchorDirective } from '@libs/ui/badge';
import { UiSize } from '@libs/ui/core';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

type PhotoChoice = 'photo' | 'broken' | 'none';

/** Inline sample photo, so the docs don't depend on an external image host. */
const SAMPLE_PHOTO =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs>' +
      '<rect width="64" height="64" fill="url(#g)"/>' +
      '<circle cx="32" cy="26" r="11" fill="#fff" fill-opacity=".85"/>' +
      '<path d="M12 60c2-12 11-18 20-18s18 6 20 18z" fill="#fff" fill-opacity=".85"/></svg>'
  );

@Component({
  selector: 'doc-avatar',
  imports: [
    FormsModule,
    UiAvatarComponent,
    UiAvatarGroupComponent,
    UiBadgeAnchorDirective,
    PlaygroundComponent,
    ApiTableComponent,
    CodeBlockComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './avatar-doc.component.html',
})
export class AvatarDocComponent {
  readonly sizes: UiSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  readonly members = ['Linh Tran', 'An Nguyen', 'Bao Le', 'Chi Pham', 'Dung Vo', 'Giang Do'];

  readonly photo = signal<PhotoChoice>('photo');
  readonly name = signal('Nguyễn Văn An');
  readonly size = signal<UiSize>('lg');
  readonly shape = signal<UiAvatarShape>('circle');
  readonly max = signal(3);

  readonly src = computed(() => {
    switch (this.photo()) {
      case 'photo':
        return SAMPLE_PHOTO;
      case 'broken':
        return '/does-not-exist.png';
      default:
        return null;
    }
  });

  readonly generatedCode = computed(() => {
    const attrs: string[] = [];
    if (this.photo() !== 'none') attrs.push('[src]="user.avatarUrl"');
    if (this.name()) attrs.push(`name="${this.name()}"`);
    if (this.size() !== 'md') attrs.push(`size="${this.size()}"`);
    if (this.shape() !== 'circle') attrs.push(`shape="${this.shape()}"`);
    return `<ui-avatar${attrs.length ? ' ' + attrs.join(' ') : ''} />`;
  });

  readonly groupCode = computed(
    () => `<ui-avatar-group [max]="${this.max()}" size="sm">
  @for (m of members; track m.id) {
    <ui-avatar [src]="m.avatarUrl" [name]="m.name" />
  }
</ui-avatar-group>`
  );

  readonly statusCode = `<ui-avatar name="Linh Tran"
           uiBadge uiBadgeDot uiBadgeColor="success"
           uiBadgePosition="bottom-end" uiBadgeOverlap="circular"
           uiBadgeDescription="Online" />`;

  readonly apiRows: ApiRow[] = [
    {
      name: 'src',
      type: 'string | null',
      default: 'null',
      description: 'Image URL. Falls back if it fails.',
    },
    {
      name: 'name',
      type: 'string | null',
      default: 'null',
      description: 'Initials fallback (first + last word) and default accessible name.',
    },
    {
      name: 'alt',
      type: 'string | null',
      default: 'null',
      description: 'Overrides the accessible name. "" (or no name) makes the avatar decorative.',
    },
    {
      name: 'size',
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
      default: "group size ?? 'md'",
      description: '24 / 32 / 40 / 48 / 64px.',
    },
    {
      name: 'shape',
      type: "'circle' | 'square'",
      default: "'circle'",
      description: 'Corner style.',
    },
    {
      name: 'content',
      type: 'ng-content',
      description: 'Custom fallback, used when there are no initials.',
    },
    {
      name: 'ui-avatar-group [max]',
      type: 'number | null',
      default: 'null',
      description: 'Avatars beyond max are hidden behind a "+N" avatar.',
    },
    {
      name: 'ui-avatar-group [size] / [shape]',
      type: 'UiSize / UiAvatarShape',
      default: "'md' / 'circle'",
      description: 'Applied to avatars that do not set their own.',
    },
  ];
}
