import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { NavbarService } from '../../services/navabr.service';
import { NavbarItem } from '../../interfaces/navbarItem.interface';
import { AuthService } from '../../services/auth.service';
import { Subscription, filter } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgbCollapse],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  navbarItems: NavbarItem[] = [];
  private subscriptions = new Subscription();
  isCollapsed = true;
  svgCache: {[key: string]: SafeUrl} = {};
  
  constructor(
    private navbarService: NavbarService,
    public authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    // Subscribe to route changes to update active states
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActiveStates();
    });
  }

  ngOnInit(): void {
    this.loadNavbarItems();
    
    // Subscribe to authentication state changes
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(() => {
        this.loadNavbarItems();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadNavbarItems(): void {
    this.subscriptions.add(
      this.navbarService.getNavbarItems().subscribe(items => {
        this.navbarItems = items;
        this.updateActiveStates();
      })
    );
  }

  isActive(item: NavbarItem): boolean {
    if (!item.menuLink) return false;
    return this.router.isActive(item.menuLink, {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }

  // Update active states for all menu items
  private updateActiveStates(): void {
    if (!this.navbarItems) return;

    const updateItemActiveState = (items: NavbarItem[]): void => {
      items.forEach(item => {
        // Check if current item is active
        const isActive = item.menuLink 
          ? this.router.isActive(item.menuLink, {
              paths: 'subset',
              queryParams: 'subset',
              fragment: 'ignored',
              matrixParams: 'ignored'
            })
          : false;
        
        // Check if any child is active
        const hasActiveChild = item.listOfSubMenu && item.listOfSubMenu.length > 0 
          ? item.listOfSubMenu.some(subItem => this.hasActiveChild(subItem))
          : false;

        item.isActive = isActive || hasActiveChild;
        
        // Update child items
        if (item.listOfSubMenu && item.listOfSubMenu.length > 0) {
          updateItemActiveState(item.listOfSubMenu);
        }
      });
    };

    updateItemActiveState(this.navbarItems);
  }

  // Check if an item or any of its children is active
  hasActiveChild(item: NavbarItem): boolean {
    if (!item.listOfSubMenu || item.listOfSubMenu.length === 0) {
      return item.menuLink 
        ? this.router.isActive(item.menuLink, {
            paths: 'subset',
            queryParams: 'subset',
            fragment: 'ignored',
            matrixParams: 'ignored'
          })
        : false;
    }
    return item.listOfSubMenu.some(subItem => this.hasActiveChild(subItem));
  }

  toggleSubMenu(item: NavbarItem, event: Event): void {
    if (item.listOfSubMenu && item.listOfSubMenu.length > 0) {
      event.preventDefault();
      event.stopPropagation();
      // Toggle expanded state
      item.isExpanded = !item.isExpanded;
    }
  }

  getSafeSvg(svgUrl: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(svgUrl);
  }

  logout(): void {
    this.authService.logout();
    this.isCollapsed = true; // Close the mobile menu after logout
    this.router.navigate(['/login']);
  }
}
