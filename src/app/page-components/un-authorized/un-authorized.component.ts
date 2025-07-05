import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-un-authorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './un-authorized.component.html',
  styleUrls: ['./un-authorized.component.css']
})
export class UnAuthorizedComponent {
  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  goBack() {
    window.history.back();
  }
}
