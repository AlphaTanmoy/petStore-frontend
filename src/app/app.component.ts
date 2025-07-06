import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { PopupComponent } from './page-components/pop-up/pop-up.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { UserTypes } from './constants/enums/user-types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, 
    PopupComponent,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <app-popup></app-popup>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .main-content {
      flex: 1;
      padding: 2rem;
      background-color: #f8f9fa;
    }
    
    @media (max-width: 768px) {
      .main-content {
        padding: 1rem;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'pet-store-frontend';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    // Initialize auth state from localStorage if available
    const token = localStorage.getItem('token');
    if (token) {
      // You might want to validate the token here
      const userRole = this.getUserRoleFromToken(token);
      if (userRole) {
        this.authService.login(userRole);
      }
    }

    // Subscribe to route changes
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Handle any route-based logic here
      }
    });
  }

  private getUserRoleFromToken(token: string): UserTypes | null {
    try {
      // Extract the payload part of the JWT token
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      const { role } = JSON.parse(decodedPayload);
      
      // Ensure the role is a valid UserType
      if (role && Object.values(UserTypes).includes(role as UserTypes)) {
        return role as UserTypes;
      }
      return null;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }
}
