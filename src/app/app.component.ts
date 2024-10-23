import { Component } from '@angular/core';
import { WelcomeComponent } from './modules/welcome/welcome.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WelcomeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
