/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as i0 from '@angular/core';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { SINGLE_DATE_SELECTION_MODEL_PROVIDER } from './date-selection-model';
import { DatepickerBase } from './datepicker-base';
export class Datepicker extends DatepickerBase {
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: Datepicker,
    deps: null,
    target: i0.ɵɵFactoryTarget.Component,
  });
  static ɵcmp = i0.ɵɵngDeclareComponent({
    minVersion: '14.0.0',
    version: '18.2.13',
    type: Datepicker,
    isStandalone: true,
    selector: 'date-picker',
    providers: [
      SINGLE_DATE_SELECTION_MODEL_PROVIDER,
      { provide: DatepickerBase, useExisting: Datepicker },
    ],
    exportAs: ['datepicker'],
    usesInheritance: true,
    ngImport: i0,
    template: '',
    isInline: true,
    changeDetection: i0.ChangeDetectionStrategy.OnPush,
    encapsulation: i0.ViewEncapsulation.None,
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '18.2.13',
  ngImport: i0,
  type: Datepicker,
  decorators: [
    {
      type: Component,
      args: [
        {
          selector: 'date-picker',
          template: '',
          exportAs: 'datepicker',
          changeDetection: ChangeDetectionStrategy.OnPush,
          encapsulation: ViewEncapsulation.None,
          providers: [
            SINGLE_DATE_SELECTION_MODEL_PROVIDER,
            { provide: DatepickerBase, useExisting: Datepicker },
          ],
          standalone: true,
        },
      ],
    },
  ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1waWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9saWJzL2RhdGUtcGlja2VyL3NyYy9saWIvZGF0ZS1waWNrZXIvZGF0ZS1waWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFFLHVCQUF1QixFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN0RixPQUFPLEVBQUUsY0FBYyxFQUFxQixNQUFNLG1CQUFtQixDQUFDO0FBQ3RFLE9BQU8sRUFBRSxvQ0FBb0MsRUFBRSxNQUFNLHdCQUF3QixDQUFDOztBQWM5RSxNQUFNLE9BQU8sVUFBYyxTQUFRLGNBQWlEO3dHQUF2RSxVQUFVOzRGQUFWLFVBQVUsMERBTlY7WUFDVCxvQ0FBb0M7WUFDcEMsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUU7U0FDckQsMkVBUFMsRUFBRTs7NEZBVUQsVUFBVTtrQkFadEIsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsYUFBYTtvQkFDdkIsUUFBUSxFQUFFLEVBQUU7b0JBQ1osUUFBUSxFQUFFLFlBQVk7b0JBQ3RCLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO29CQUMvQyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtvQkFDckMsU0FBUyxFQUFFO3dCQUNULG9DQUFvQzt3QkFDcEMsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLFdBQVcsWUFBWSxFQUFFO3FCQUNyRDtvQkFDRCxVQUFVLEVBQUUsSUFBSTtpQkFDakIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIENvbXBvbmVudCwgVmlld0VuY2Fwc3VsYXRpb24gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IERhdGVwaWNrZXJCYXNlLCBEYXRlcGlja2VyQ29udHJvbCB9IGZyb20gJy4vZGF0ZXBpY2tlci1iYXNlJztcbmltcG9ydCB7IFNJTkdMRV9EQVRFX1NFTEVDVElPTl9NT0RFTF9QUk9WSURFUiB9IGZyb20gJy4vZGF0ZS1zZWxlY3Rpb24tbW9kZWwnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdkYXRlLXBpY2tlcicsXG4gIHRlbXBsYXRlOiAnJyxcbiAgZXhwb3J0QXM6ICdkYXRlcGlja2VyJyxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIHByb3ZpZGVyczogW1xuICAgIFNJTkdMRV9EQVRFX1NFTEVDVElPTl9NT0RFTF9QUk9WSURFUixcbiAgICB7IHByb3ZpZGU6IERhdGVwaWNrZXJCYXNlLCB1c2VFeGlzdGluZzogRGF0ZXBpY2tlciB9LFxuICBdLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBEYXRlcGlja2VyPEQ+IGV4dGVuZHMgRGF0ZXBpY2tlckJhc2U8RGF0ZXBpY2tlckNvbnRyb2w8RD4sIEQgfCBudWxsLCBEPiB7fVxuIl19
