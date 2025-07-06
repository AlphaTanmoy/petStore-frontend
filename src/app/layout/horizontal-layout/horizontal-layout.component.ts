import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-horizontal-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    RouterOutlet, 
    NavbarComponent
  ],
  templateUrl: './horizontal-layout.component.html',
  styleUrls: ['./horizontal-layout.component.css']
})
export class HorizontalLayoutComponent implements OnInit {
  currentUserRole: string = ''; // Will be set based on auth state

  constructor() {
    // TODO: Get user role from auth service
    // this.currentUserRole = this.authService.getUserRole();
    this.currentUserRole = 'admin'; // Temporary for testing
  }

  ngOnInit(): void {
    // Initialization logic here
  }
}
