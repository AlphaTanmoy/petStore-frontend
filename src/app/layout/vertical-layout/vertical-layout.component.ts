import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-vertical-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    RouterOutlet, 
    NavbarComponent
  ],
  template: `
    <div class="app-container">
      <aside class="sidebar" [class.sidebar-open]="isSidebarOpen">
        <div class="logo">PetStore</div>
        <app-navbar [isHorizontal]="false" [userRole]="currentUserRole" (navItemClick)="onNavItemClick()"></app-navbar>
      </aside>
      <div class="backdrop" [class.backdrop-open]="isSidebarOpen" (click)="onBackdropClick()"></div>
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
      position: relative;
    }
    
    .sidebar {
      width: 250px;
      background: #2c3e50;
      color: white;
      height: 100vh;
      position: sticky;
      top: 0;
      overflow-y: auto;
      transform: translateX(-250px);
      transition: transform 0.3s ease-in-out;
    }
    
    .sidebar.sidebar-open {
      transform: translateX(0);
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
    
    .backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease-in-out;
    }
    
    .backdrop.backdrop-open {
      opacity: 1;
      visibility: visible;
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
export class VerticalLayoutComponent implements OnInit {
  currentUserRole: string = ''; // Will be set based on auth state
  isMobileView = false;
  isSidebarOpen = false;
  
  constructor() {
    // TODO: Get user role from auth service
    // this.currentUserRole = this.authService.getUserRole();
    this.currentUserRole = 'admin'; // Temporary for testing
  }

  ngOnInit(): void {
    this.checkViewport();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkViewport();
  }

  private checkViewport() {
    this.isMobileView = window.innerWidth < 992; // Bootstrap's lg breakpoint
    if (!this.isMobileView) {
      this.isSidebarOpen = true;
    } else {
      this.isSidebarOpen = false;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // Close sidebar when clicking on backdrop (mobile)
  onBackdropClick() {
    if (this.isMobileView) {
      this.isSidebarOpen = false;
    }
  }

  // Close sidebar when clicking on a nav item (mobile)
  onNavItemClick() {
    if (this.isMobileView) {
      this.isSidebarOpen = false;
    }
  }
}
