import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LayoutComponent],
  template: `
    <chess-layout>
      <router-outlet></router-outlet>
    </chess-layout>
  `,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'chess';
}
