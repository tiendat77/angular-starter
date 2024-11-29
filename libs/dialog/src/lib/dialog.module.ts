import { DialogModule as CdkDialogModule } from '@angular/cdk/dialog';
import { NgModule } from '@angular/core';

import { DialogActionsDirective } from './dialog-actions.directive';
import { DialogBodyDirective } from './dialog-body.directive';
import { DialogDismissDirective } from './dialog-dismiss.directive';
import { DialogHeaderDirective } from './dialog-header.directive';
import { DialogTitleDirective } from './dialog-title.directive';
import { DialogLayoutComponent } from './dialog.component';
import { DialogService } from './dialog.service';

const DIRECTIVES = [
  DialogActionsDirective,
  DialogBodyDirective,
  DialogDismissDirective,
  DialogHeaderDirective,
  DialogTitleDirective,
];

@NgModule({
  imports: [CdkDialogModule, DialogLayoutComponent, ...DIRECTIVES],
  exports: [DialogLayoutComponent, ...DIRECTIVES],
  providers: [DialogService],
})
export class DialogModule {}
