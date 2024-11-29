import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { HotkeysShortcutPipe } from '../hotkeys-shortcut.pipe';
import { HotkeysService } from '../hotkeys.service';

@Component({
  standalone: true,
  imports: [HotkeysShortcutPipe],
  templateUrl: './hotkeys-help.component.html',
  styleUrl: './hotkeys-help.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotkeysHelpComponent {
  private hotkeysService = inject(HotkeysService);
  hotkeys = this.hotkeysService.getShortcuts();

  @Input() title = 'Available Shortcuts';
  @Output() readonly dismiss = new EventEmitter();

  handleDismiss() {
    this.dismiss.emit();
  }
}
