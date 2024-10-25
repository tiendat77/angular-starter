import { Component } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  templateUrl: './logo.component.html',
  host: {
    class: 'inline-flex',
  },
})
export class LogoComponent {}
