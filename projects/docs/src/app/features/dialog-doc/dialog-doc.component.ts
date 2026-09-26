import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiButtonComponent } from '@libs/ui/button';
import { DialogConfirmConfig, DialogService } from '@libs/ui/dialog';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';
import { DialogExampleComponent, DialogExampleData } from './dialog-example.component';

type ConfirmType = NonNullable<DialogConfirmConfig['type']>;

@Component({
  selector: 'doc-dialog',
  imports: [
    FormsModule,
    UiButtonComponent,
    PlaygroundComponent,
    CodeBlockComponent,
    ApiTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialog-doc.component.html',
})
export class DialogDocComponent {
  private readonly _dialog = inject(DialogService);

  readonly type = signal<ConfirmType>('info');
  readonly title = signal('Delete project?');
  readonly message = signal('This action cannot be undone.');
  readonly alert = signal(false);
  readonly fullscreen = signal(false);
  readonly lastResult = signal<string | null>(null);

  readonly generatedCode = computed(
    () => `private readonly _dialog = inject(DialogService);

confirmDelete(): void {
  this._dialog
    .confirm({
      type: '${this.type()}',
      title: '${this.title()}',
      message: '${this.message()}',
    })
    .closed.subscribe((confirmed) => {
      // true when "Confirm" was clicked, undefined when dismissed
    });
}`
  );

  readonly customCode = `<!-- my-dialog.html, opened with this._dialog.open(MyDialogComponent, { data }) -->
<dialog-layout [alert]="false" [fullscreen]="false">
  <ng-template dialog-title>Edit profile</ng-template>

  <ng-template dialog-body>...</ng-template>

  <ng-template dialog-actions>
    <button uiButton dialog-dismiss variant="outline">Cancel</button>
    <button uiButton (click)="save()">Save</button>
  </ng-template>
</dialog-layout>`;

  readonly apiRows: ApiRow[] = [
    {
      name: 'DialogService.open()',
      type: '(component | template, DialogConfig) => DialogRef',
      description: 'Opens any component or template in a CDK dialog.',
    },
    {
      name: 'DialogService.confirm()',
      type: '(DialogConfirmConfig) => DialogRef<boolean>',
      description: 'Opens the built-in confirm dialog. Closes with true on Confirm.',
    },
    {
      name: 'DialogService.closeAll()',
      type: '() => void',
      description: 'Closes every open dialog.',
    },
    {
      name: 'DialogConfirmConfig.type',
      type: "'info' | 'success' | 'warning' | 'error'",
      default: "'info'",
      description: 'Colors the top indicator and the confirm button.',
    },
    {
      name: '<dialog-layout> alert',
      type: 'boolean',
      default: 'false',
      description: 'Compact, auto-sized dialog (max 40rem) instead of a near full-screen panel.',
    },
    {
      name: '<dialog-layout> fullscreen',
      type: 'boolean',
      default: 'false',
      description: 'Covers the whole viewport.',
    },
    {
      name: 'dialog-title / dialog-body / dialog-actions',
      type: 'ng-template directive',
      description: 'Slots for the header title, the scrollable body and the pinned footer.',
    },
    {
      name: 'dialog-dismiss',
      type: 'directive',
      description: 'Closes the surrounding dialog on click.',
    },
  ];

  openConfirm(): void {
    this._dialog
      .confirm({ type: this.type(), title: this.title(), message: this.message() })
      .closed.subscribe((confirmed) => this.lastResult.set(confirmed ? 'Confirmed' : 'Dismissed'));
  }

  openCustom(): void {
    this._dialog.open<DialogExampleComponent, DialogExampleData>(DialogExampleComponent, {
      data: { alert: this.alert(), fullscreen: this.fullscreen() },
    });
  }
}
