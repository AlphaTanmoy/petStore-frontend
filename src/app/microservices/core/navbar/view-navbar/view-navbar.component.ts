import { Component, OnInit, AfterViewInit, HostListener, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarControlService } from '../../../../services/navbar.control.service';
import { PopupService } from '../../../../services/popup.service';
import { debounceTime, distinctUntilChanged, Subject, finalize } from 'rxjs';
import { NavbarItemResponse, PaginationResponse, NavbarListRequest } from '../../../../interfaces/navbar.interface';
import { PopupType } from '../../../../constants/enums/popup-types';
import { UserTypes } from '../../../../constants/enums/user-types';
import { SingleSelectComponent } from '../../../../page-components/single-select/single-select.component';
import { MultiSelectComponent } from '../../../../page-components/multi-select/multi-select.component';

interface NavbarItem extends NavbarItemResponse {
  roles: string[];
  parentId: string | null;
  displayOrder: number;
}

@Component({
  selector: 'app-view-navbar',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    SingleSelectComponent,
    MultiSelectComponent
  ],
  templateUrl: './view-navbar.component.html'
})
export class ViewNavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  // Pagination
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  
  // Menu type options for single select
  menuTypeOptions = ['All Menu Items', 'Parent Menus Only', 'Sub Menus Only'];
  selectedMenuType: string | null = null;
  
  @ViewChild('menuTypeSelect') menuTypeSelect!: SingleSelectComponent;
  @ViewChild('rolesSelect') rolesSelect!: MultiSelectComponent;

  // Role options for multi-select with proper formatting
  roleOptions: { value: string; label: string }[] = [
    { value: 'ROLE_MASTER', label: 'Master' },
    { value: 'ROLE_CUSTOMER', label: 'Customer' },
    { value: 'ROLE_SELLER', label: 'Seller' },
    { value: 'ROLE_ADMIN', label: 'Admin' },
    { value: 'ROLE_DOCTOR', label: 'Doctor' },
    { value: 'ROLE_CUSTOMER_CARE', label: 'Customer Care' },
    { value: 'ROLE_RAIDER', label: 'Raider' },
    { value: 'ROLE_GUEST', label: 'Guest' }
  ];
  selectedRoles: string[] = [];
  
  // Map display names to API values for menu type
  private menuTypeMap: {[key: string]: string} = {
    'All Menu Items': 'all',
    'Parent Menus Only': 'parent',
    'Sub Menus Only': 'sub'
  };

  navbarItems: NavbarItem[] = [];
  filteredNavbarItems: NavbarItem[] = [];
  searchText: string = '';
  isLoading: boolean = false;
  private searchSubject = new Subject<string>();
  readonly DEBOUNCE_TIME_MS = 300;
  readonly PAGE_SIZE = 10;
  isInitialLoad = true;
  hasMoreData = true;
  private offsetToken: string | null = null;
  private lastLoadTime: number = 0;
  private loadDebounceTime: number = 500; // 500ms debounce time

  constructor(
    private navbarService: NavbarControlService,
    private popupService: PopupService
  ) {
    // Debounce search input
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.onFilterChange();
    });
  }

  ngOnInit(): void {
    this.fetchNavbarItems();
  }

  ngAfterViewInit(): void {
    // Initial check after a small delay to ensure DOM is rendered
    setTimeout(() => this.checkInitialLoad(), 100);
  }

  private fetchNavbarItems() {
    if (this.isLoading || !this.hasMoreData) return;
    
    this.isLoading = true;
    
    // Only pass offsetToken if we have one and it's not the initial load
    const offset = !this.isInitialLoad && this.offsetToken ? this.offsetToken : undefined;
    
    // Get valid roles from selected roles
    const validRoles = this.selectedRoles.length > 0 
      ? this.selectedRoles.filter(role => this.roleOptions.some(opt => opt.value === role))
      : undefined;
    
    const params: NavbarListRequest = {
      queryString: this.searchText || undefined,
      limit: this.PAGE_SIZE,
      offsetToken: offset,
      showSubMenusOnly: this.selectedMenuType === 'Sub Menus Only',
      listOfRolesCanAccess: validRoles && validRoles.length > 0 ? validRoles : undefined
    };
    
    console.log('Fetching navbar items with params:', params);
    
    this.navbarService.getNavbarItems(params).pipe(
      finalize(() => {
        this.isLoading = false;
        this.isInitialLoad = false;
        console.log('Finished loading navbar items');
      })
    ).subscribe({
      next: (response: PaginationResponse<NavbarItemResponse>) => {
        const newItems = response.data.map(item => this.mapToNavbarItem(item));
        
        if (newItems.length === 0) {
          this.hasMoreData = false;
        } else {
          // Only append new items if it's not the initial load
          if (this.isInitialLoad) {
            this.navbarItems = [...newItems];
          } else {
            this.navbarItems = [...this.navbarItems, ...newItems];
          }
          
          // Update offset token for next request
          this.offsetToken = response.offsetToken || null;
          this.hasMoreData = !!this.offsetToken; // If we have an offset token, there might be more data
        }
        
        this.applyFilters();
      },
      error: (error: any) => {
        console.error('Error fetching navbar items:', error);
        this.popupService.showPopup(PopupType.ERROR, 'Error', 'Failed to load navbar items. Please try again later.');
      }
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    const viewportHeight = window.innerHeight;
    const scrollPosition = window.scrollY;
    const contentHeight = document.documentElement.scrollHeight;
    const distanceToBottom = contentHeight - (scrollPosition + viewportHeight);
    
    // Check if we're near the bottom of the page (within 100px)
    const nearBottom = distanceToBottom < 100;
    const viewportNotFilled = contentHeight < viewportHeight;
    
    if ((nearBottom || viewportNotFilled) && !this.isLoading && this.hasMoreData) {
      const now = Date.now();
      if (now - this.lastLoadTime > this.loadDebounceTime) {
        this.lastLoadTime = now;
        this.loadMore();
      }
    }
  }

  // Check if we need to load more on initial render
  private checkInitialLoad(): void {
    const viewportHeight = window.innerHeight;
    const contentHeight = document.documentElement.scrollHeight;
    const viewportNotFilled = contentHeight < viewportHeight;
    
    if (viewportNotFilled && !this.isLoading && this.hasMoreData) {
      this.fetchNavbarItems();
    }
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchText);
  }

  // Get the current menu type value for API calls
  private get currentMenuTypeValue(): string {
    return this.selectedMenuType ? this.menuTypeMap[this.selectedMenuType] : 'all';
  }

  onMenuTypeChange(selectedType: string | null) {
    this.selectedMenuType = selectedType;
    this.onFilterChange();
  }

  onRolesChange(roles: string[]) {
    console.log('Selected roles changed:', roles);
    this.selectedRoles = roles || [];
    this.pageIndex = 0; // Reset to first page when filters change
    this.offsetToken = null; // Reset pagination
    this.hasMoreData = true; // Reset hasMoreData flag
    this.navbarItems = []; // Clear existing items
    this.filteredNavbarItems = []; // Clear filtered items
    this.fetchNavbarItems(); // Fetch with new filters
  }

  loadMore() {
    if (this.isLoading || !this.hasMoreData) return;
    this.fetchNavbarItems();
  }

  private mapToNavbarItem(item: NavbarItemResponse): NavbarItem {
    const roles: string[] = [];
    if (item.canMasterAccess) roles.push('ROLE_MASTER');
    if (item.canAdminAccess) roles.push('ROLE_ADMIN');
    if (item.canUserAccess) roles.push('ROLE_USER');
    if (item.canDoctorAccess) roles.push('ROLE_DOCTOR');
    if (item.canSellerAccess) roles.push('ROLE_SELLER');
    if (item.canRiderAccess) roles.push('ROLE_RIDER');
    if (item.customerCareAccess) roles.push('ROLE_CUSTOMER_CARE');
    if (item.isVisibleToGuest) roles.push('ROLE_GUEST');

    return {
      ...item,
      roles,
      parentId: item.isASubMenu ? 'Parent ID' : null,
      displayOrder: 0
    };
  }

  private applyFilters() {
    // Filter by search text
    let filtered = [...this.navbarItems];
    
    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(item => 
        item.menuName?.toLowerCase().includes(searchLower) ||
        item.menuLink?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by menu type
    if (this.selectedMenuType) {
      const menuType = this.menuTypeMap[this.selectedMenuType];
      if (menuType === 'parent') {
        filtered = filtered.filter(item => item.isASubMenu === false);
      } else if (menuType === 'sub') {
        filtered = filtered.filter(item => item.isASubMenu === true);
      }
    }
    
    // Filter by roles if any selected
    if (this.selectedRoles.length > 0) {
      filtered = filtered.filter(item => {
        // Check if item has any of the selected roles
        return this.selectedRoles.some(role => {
          const roleKey = role.replace('ROLE_', '').toLowerCase();
          return (item as any)[`can${roleKey.charAt(0).toUpperCase() + roleKey.slice(1)}Access`] === true;
        });
      });
    }
    
    this.filteredNavbarItems = filtered;
  }

  trackById(index: number, item: NavbarItem): string {
    return item.id;
  }

  onFilterChange() {
    this.offsetToken = null;
    this.isInitialLoad = true;
    this.hasMoreData = true;
    this.navbarItems = [];
    this.filteredNavbarItems = [];
    this.fetchNavbarItems();
  }

  getAccessLevels(item: NavbarItemResponse): string {
    const accessLevels = [];
    if (item.canMasterAccess) accessLevels.push('Master');
    if (item.canAdminAccess) accessLevels.push('Admin');
    if (item.canUserAccess) accessLevels.push('User');
    if (item.canDoctorAccess) accessLevels.push('Doctor');
    if (item.canSellerAccess) accessLevels.push('Seller');
    if (item.canRiderAccess) accessLevels.push('Rider');
    if (item.customerCareAccess) accessLevels.push('Customer Care');
    if (item.isVisibleToGuest) accessLevels.push('Guest');
    
    return accessLevels.join(', ') || 'None';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  ngOnDestroy() {
    // Clean up the search subject
    this.searchSubject.complete();
  }
}
