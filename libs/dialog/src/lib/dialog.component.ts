import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  DestroyRef,
  ElementRef,
  inject,
  Input,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { PortalModule } from '@angular/cdk/portal';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

import PerfectScrollbar from 'perfect-scrollbar';

import { DialogActionsDirective } from './dialog-actions.directive';
import { DialogBodyDirective } from './dialog-body.directive';
import { DialogDismissDirective } from './dialog-dismiss.directive';
import { DialogHeaderDirective } from './dialog-header.directive';
import { DialogTitleDirective } from './dialog-title.directive';

@Component({
  standalone: true,
  selector: 'dialog-layout',
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PortalModule, DialogDismissDirective, DialogHeaderDirective],
  host: {
    '[class.just-dialog]': '!alert',
    '[class.alert-dialog]': 'alert',
    '[class.full-screen-dialog]': 'fullscreen',
    class: 'animate__fadeInUp animate__animated animate__faster',
  },
})
export class DialogLayoutComponent implements AfterViewInit, AfterContentInit {
  /**
   * Input
   */
  @Input()
  get alert() {
    return this._alert;
  }
  set alert(value: BooleanInput) {
    this._alert = coerceBooleanProperty(value);
  }
  private _alert = false;

  @Input()
  get fullscreen() {
    return this._fullscreen;
  }
  set fullscreen(value: BooleanInput) {
    this._fullscreen = coerceBooleanProperty(value);
  }
  private _fullscreen = false;

  /**
   * Content children
   */
  /** Content for the dialog title given by `<ng-template dialog-title>`. */
  @ContentChild(DialogTitleDirective)
  protected _titleTemplate: DialogTitleDirective | undefined;

  /** Content for the dialog title given by `<ng-template dialog-actions>`. */
  @ContentChild(DialogActionsDirective)
  protected _actionTemplate: DialogActionsDirective | undefined;

  /** Content for the dialog title given by `<ng-template dialog-body>`. */
  @ContentChild(DialogBodyDirective)
  protected _bodyTemplate: DialogBodyDirective | undefined;

  @ViewChild(DialogHeaderDirective)
  private _headerRef: DialogHeaderDirective | undefined;

  _hasTitle = false;

  /**
   * Private properties
   */
  private _element = inject(ElementRef);
  private _destroyRef = inject(DestroyRef);

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngAfterContentInit() {
    this._checkTitleTypes();
  }

  ngAfterViewInit(): void {
    new PerfectScrollbar(this._element?.nativeElement, {});

    /**
     * Watch scroll event to slide the header up
     */
    fromEvent(this._element?.nativeElement, 'scroll')
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((event) => {
        this._onScroll(event);
      });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private _checkTitleTypes() {
    this._hasTitle = !!this._titleTemplate;
  }

  private _onScroll(event: any) {
    if (this._getScrollTop(event) > 35) {
      this._headerRef?.visibility(true);
    } else {
      this._headerRef?.visibility(false);
    }
  }

  private _getScrollTop(event: any) {
    return event?.target.scrollTop || event?.target?.documentElement?.scrollTop || 0;
  }
}
