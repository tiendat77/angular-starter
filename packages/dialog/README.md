# Dialog

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.2.0.

## Usage

```typescript
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, inject } from '@angular/core';
import { DialogModule } from '@libs/dialog';

@Component({
  standalone: true,
  selector: 'app-example-dialog',
  template: `
    <dialog-layout>
      <ng-template dialog-title> Lorem ipsum dolor sit amet </ng-template>

      <ng-template dialog-body>
        <p>Hello {{ data.hello }}</p>
        <p>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
          been the industry's standard dummy text ever since the 1500s, when an unknown printer took
          a galley of type and scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting, remaining essentially
          unchanged. It was popularised in the 1960s with the release of Letraset sheets containing
          Lorem Ipsum passages, and more recently with desktop publishing software like Aldus
          PageMaker including versions of Lorem Ipsum.
        </p>
        <p>Why do we use it?</p>
        <p>
          It is a long established fact that a reader will be distracted by the readable content of
          a page when looking at its layout. The point of using Lorem Ipsum is that it has a
          more-or-less normal distribution of letters, as opposed to using 'Content here, content
          here', making it look like readable English. Many desktop publishing packages and web page
          editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum'
          will uncover many web sites still in their infancy. Various versions have evolved over the
          years, sometimes by accident, sometimes on purpose (injected humour and the like).
        </p>
        <p>Where does it come from?</p>
        <p>
          Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece
          of classical Latin literature from 45 BC, making it over 2000 years old. Richard
          McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the
          more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the
          cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum
          comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes
          of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of
          ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum
          dolor sit amet..", comes from a line in section 1.10.32.
        </p>
        <p>
          The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those
          interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero
          are also reproduced in their exact original form, accompanied by English versions from the
          1914 translation by H. Rackham.
        </p>
        <p>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
          been the industry's standard dummy text ever since the 1500s, when an unknown printer took
          a galley of type and scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting, remaining essentially
          unchanged. It was popularised in the 1960s with the release of Letraset sheets containing
          Lorem Ipsum passages, and more recently with desktop publishing software like Aldus
          PageMaker including versions of Lorem Ipsum.
        </p>
        <p>Why do we use it?</p>
        <p>
          It is a long established fact that a reader will be distracted by the readable content of
          a page when looking at its layout. The point of using Lorem Ipsum is that it has a
          more-or-less normal distribution of letters, as opposed to using 'Content here, content
          here', making it look like readable English. Many desktop publishing packages and web page
          editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum'
          will uncover many web sites still in their infancy. Various versions have evolved over the
          years, sometimes by accident, sometimes on purpose (injected humour and the like).
        </p>
        <p>Where does it come from?</p>
        <p>
          Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece
          of classical Latin literature from 45 BC, making it over 2000 years old. Richard
          McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the
          more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the
          cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum
          comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes
          of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of
          ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum
          dolor sit amet..", comes from a line in section 1.10.32.
        </p>
        <p>
          The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those
          interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero
          are also reproduced in their exact original form, accompanied by English versions from the
          1914 translation by H. Rackham.
        </p>
        <p>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
          been the industry's standard dummy text ever since the 1500s, when an unknown printer took
          a galley of type and scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting, remaining essentially
          unchanged. It was popularised in the 1960s with the release of Letraset sheets containing
          Lorem Ipsum passages, and more recently with desktop publishing software like Aldus
          PageMaker including versions of Lorem Ipsum.
        </p>
      </ng-template>

      <ng-template dialog-actions>
        <button
          class="btn btn-outline"
          dialog-dismiss
        >
          Close
        </button>

        <button class="btn btn-primary">Apply</button>
      </ng-template>
    </dialog-layout>
  `,
  imports: [DialogModule],
})
export class ExampleDialogComponent {
  constructor(
    public dialogRef: DialogRef<string>,
    @Inject(DIALOG_DATA)
    public data: {
      hello: string;
    }
  ) {}
}

@Component({
  standalone: true,
  selector: 'app-example',
  template: `
    <button
      class="btn btn-primary mt-4"
      (click)="open()"
    >
      Open Dialog
    </button>
  `,
})
export class ExampleComponent {
  private _dialog = inject(DialogService);

  open() {
    this._dialog.open(ExampleDialogComponent, {
      data: {
        hello: 'world',
      },
    });
  }
}
```

## Code scaffolding

Run `ng generate component component-name --project dialog` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project dialog`.

> Note: Don't forget to add `--project dialog` or else it will be added to the default project in your `angular.json` file.

## Build

Run `ng build dialog` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build dialog`, go to the dist folder `cd dist/dialog` and run `npm publish`.

## Running unit tests

Run `ng test dialog` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
