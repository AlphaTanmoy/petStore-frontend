import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavbarItem } from '../../interfaces/navbarItem.interface';
import { AuthService } from '../../services/auth.service';
import { NavbarService } from '../../services/navbar.service';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-horizontal-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  templateUrl: './horizontal-layout.component.html',
  styleUrl: './horizontal-layout.component.css'
})
export class HorizontalLayoutComponent implements OnInit {
  isMobileMenuOpen = false;
  
  navItems$: Observable<NavbarItem[]> = of([]);

  constructor(
    private authService: AuthService,
    private navbarService: NavbarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNavItems();
  }

  private loadNavItems(): void {
    this.navItems$ = this.navbarService.getNavbarItems().pipe(
      tap(items => console.log('Loaded navbar items (horizontal):', items))
    );
  }
  
  // private loadNavItems(): void {
  //   this.navbarService.getFilteredNavbarItems().subscribe((items: NavbarItem[]) => {
  //     this.navItems = items;
  //   });
  // }
  
  toggleDropdown(item: NavbarItem): void {
    // Update the navItems$ with the toggled state
    this.navItems$ = this.navItems$.pipe(
      map(items => {
        return items.map(i => {
          if (i !== item) {
            return { ...i, isExpanded: false };
          } else {
            return { ...i, isExpanded: !i.isExpanded };
          }
        });
      })
    );
  }
  
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  
  @HostListener('window:resize', ['$event'])
  onResize() {
    // Close mobile menu when resizing to desktop
    if (window.innerWidth >= 992) {
      this.isMobileMenuOpen = false;
    }
  }
}
