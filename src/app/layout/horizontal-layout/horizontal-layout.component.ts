import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-horizontal-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <header>
      <app-navbar [isHorizontal]="true" [userRole]="currentUserRole"></app-navbar>
    </header>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    header {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    main {
      flex: 1;
      padding: 20px;
    }
  `]
})
export class HorizontalLayoutComponent {
  // This should come from your auth service
  currentUserRole: string = 'admin'; // Example: 'admin', 'user', 'guest', etc.
}
