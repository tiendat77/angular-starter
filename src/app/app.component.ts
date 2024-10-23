import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WelcomeComponent } from './modules/welcome/welcome.component';
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, RouterOutlet, WelcomeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'angular-starter';

  array = [1, 2, 3, 4, 5];

  test() {
    const a = 1;
    const b = 2;

    if (a === 1) {
      console.log('a is 1');
    }
  }

  text() {
    return 'text';
  }
}
