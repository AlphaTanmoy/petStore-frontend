import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-vertical-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <div class="app-container">
      <aside class="sidebar">
        <div class="logo">PetStore</div>
        <app-navbar [isHorizontal]="false" [userRole]="currentUserRole"></app-navbar>
      </aside>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
    
    .app-container {
      display: flex;
      min-height: 100vh;
    }
    
    .sidebar {
      width: 250px;
      background: #2c3e50;
      color: white;
      height: 100vh;
      position: sticky;
      top: 0;
      overflow-y: auto;
    }
    
    .logo {
      padding: 20px;
      font-size: 1.5rem;
      font-weight: bold;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .main-content {
      flex: 1;
      padding: 20px;
      background-color: #f5f7fa;
    }
    
    /* Custom scrollbar for sidebar */
    ::-webkit-scrollbar {
      width: 6px;
    }
    
    ::-webkit-scrollbar-track {
      background: #2c3e50;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #4a6fa5;
      border-radius: 3px;
    }
  `]
})
export class VerticalLayoutComponent {
  // This should come from your auth service
  currentUserRole: string = 'admin'; // Example: 'admin', 'user', 'guest', etc.
}
