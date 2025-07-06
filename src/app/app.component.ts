import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { UserTypes } from './constants/enums/user-types';
import { VerticalLayoutComponent } from './layout/vertical-layout/vertical-layout.component';
import { HorizontalLayoutComponent } from './layout/horizontal-layout/horizontal-layout.component';
import { PopupComponent } from './page-components/pop-up/pop-up.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    VerticalLayoutComponent,
    HorizontalLayoutComponent,
    PopupComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'pet-store-frontend';
  isAuthenticated = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    // Subscribe to auth state changes
    this.authService.currentUser$.subscribe(({ isAuthenticated }) => {
      this.isAuthenticated = isAuthenticated;
    });
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
