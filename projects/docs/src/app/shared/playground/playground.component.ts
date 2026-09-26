import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CodeBlockComponent } from '../code-block/code-block.component';

@Component({
  selector: 'doc-playground',
  imports: [CodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-foreground text-3xl font-bold tracking-tight">{{ title() }}</h1>
        @if (description()) {
          <p class="text-muted-foreground mt-2 text-base">{{ description() }}</p>
        }
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Live Preview Canvas -->
        <div
          class="border-border bg-background relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border p-8 shadow-xs lg:col-span-2"
        >
          <div
            class="pointer-events-none absolute inset-0 opacity-20"
            style="background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 20px 20px;"
          ></div>
          <div class="relative z-10 flex w-full items-center justify-center">
            <ng-content select="[preview]" />
          </div>
        </div>

        <!-- Props Control Panel -->
        <div class="border-border bg-muted/20 flex flex-col gap-5 rounded-2xl border p-6">
          <h3 class="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
            Properties
          </h3>
          <div class="space-y-4">
            <ng-content select="[controls]" />
          </div>
        </div>
      </div>

      <!-- Synchronized Code Snippet -->
      @if (code()) {
        <div class="space-y-2">
          <h3 class="text-foreground text-sm font-semibold tracking-wide">Usage Code</h3>
          <doc-code-block [code]="code()" />
        </div>
      }

      <!-- Extra Content (API tables, guidelines) -->
      <div class="pt-6">
        <ng-content />
      </div>
    </div>
  `,
})
export class PlaygroundComponent {
  readonly title = input<string>('');
  readonly description = input<string>('');
  readonly code = input<string>('');
}
