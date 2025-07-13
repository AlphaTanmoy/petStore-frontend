import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarControlService } from '../../../../services/navbar/navbar.control.service';
import { NavbarItemResponse, ApiResponse } from '../../../../interfaces/navbar.interface';
import { CommonModule } from '@angular/common';
import { PopupService } from '../../../../services/popup.service';
import { PopupType } from '../../../../constants/enums/popup-types';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  navbarItem: NavbarItemResponse | null = null;
  parentItem: NavbarItemResponse | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navbarService: NavbarControlService,
    private popupService: PopupService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadNavbarItem(id);
      } else {
        this.error = 'No navbar item ID provided';
        this.isLoading = false;
      }
    });
  }

  loadNavbarItem(id: string): void {
    this.isLoading = true;
    this.error = null;
    
    this.navbarService.getNavbarItemById(id).subscribe({
      next: (response: ApiResponse<NavbarItemResponse>) => {
        if (response.status && response.data) {
          this.navbarItem = response.data;
          
          // Set parent item directly from the response if available
          if (this.navbarItem.parent) {
            this.parentItem = this.navbarItem.parent;
          }
          
          this.isLoading = false;
        } else {
          this.error = response.message || 'Failed to load navbar item';
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error loading navbar item:', err);
        this.error = 'An error occurred while loading the navbar item';
        this.isLoading = false;
      }
    });
  }

  loadParentItem(parentId: string): void {
    this.navbarService.getNavbarItemById(parentId).subscribe({
      next: (response: ApiResponse<NavbarItemResponse>) => {
        if (response.status && response.data) {
          this.parentItem = response.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading parent item:', err);
        // Don't show error for parent item to avoid confusion
        this.isLoading = false;
      }
    });
  }

  onEdit(): void {
    if (this.navbarItem?.id) {
      this.router.navigate(['/navbar/edit', this.navbarItem.id]);
    }
  }

  onBack(): void {
    this.router.navigate(['/view-navbar']);
  }

  viewParent(parentId: string): void {
    if (parentId) {
      this.router.navigate(['/navbar', parentId]);
    }
  }

  getRolesForItem(item: any): string[] {
    const roles: string[] = [];
    if (item.canMasterAccess) roles.push('Master');
    if (item.canAdminAccess) roles.push('Admin');
    if (item.canUserAccess) roles.push('User');
    if (item.canDoctorAccess) roles.push('Doctor');
    if (item.canSellerAccess) roles.push('Seller');
    if (item.canRiderAccess) roles.push('Rider');
    if (item.canCustomerCareAccess) roles.push('Customer Care');
    if (item.isVisibleToGuest) roles.push('Guest');
    return roles;
  }

  getAccessLevels(item: NavbarItemResponse): string[] {
    const accessLevels: string[] = [];
    
    if (item.canMasterAccess) accessLevels.push('Master');
    if (item.canAdminAccess) accessLevels.push('Admin');
    if (item.canUserAccess) accessLevels.push('User');
    if (item.canDoctorAccess) accessLevels.push('Doctor');
    if (item.canSellerAccess) accessLevels.push('Seller');
    if (item.canRiderAccess) accessLevels.push('Rider');
    if (item.canCustomerCareAccess) accessLevels.push('Customer Care');
    
    return accessLevels.length > 0 ? accessLevels : ['None'];
  }
}
