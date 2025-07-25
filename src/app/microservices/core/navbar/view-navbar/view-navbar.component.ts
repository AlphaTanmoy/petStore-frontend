import { Component, OnInit, AfterViewInit, HostListener, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from '../../../../page-components/loader/loader.component';
import { NavbarControlService } from '../../../../services/navbar/navbar.control.service';
import { PopupService } from '../../../../services/popup.service';
import { S3SvgService } from '../../../../services/s3/s3.svg.service';
import { debounceTime, distinctUntilChanged, Subject, finalize } from 'rxjs';
import { 
  NavbarItemResponse, 
  PaginationResponse, 
  NavbarListRequest, 
  IsParentMenuResponse, 
  ApiResponse 
} from '../../../../interfaces/navbar.interface';
import { PopupType } from '../../../../constants/enums/popup-types';
import { UserTypes } from '../../../../constants/enums/user-types';
import { SingleSelectComponent } from '../../../../page-components/single-select/single-select.component';
import { MultiSelectComponent } from '../../../../page-components/multi-select/multi-select.component';
import { HOSTER_URL } from '../../../../constants/constrants';

interface NavbarItem extends Omit<NavbarItemResponse, 'menuLink'> {
  roles: string[];
  parentId?: string | null;
  displayOrder?: number;
  menuDescription?: string;
  menuUrl?: string;
  menuLink?: string | null;
  dataStatus?: string;
  updatedAt?: string;
  createdDate: string;
}

@Component({
  selector: 'app-view-navbar',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    SingleSelectComponent,
    MultiSelectComponent,
    LoaderComponent
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
  
  // Show inactive items toggle
  showInActive: boolean = false;
  
  // Loader state
  isPageLoading: boolean = true;
  
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
    private popupService: PopupService,
    private s3SvgService: S3SvgService,
    public router: Router
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
    this.loadNavbarItems();
  }
  
  /**
   * Load navbar items with loading state
   */
  private loadNavbarItems(): void {
    this.isPageLoading = true;
    this.fetchNavbarItems();
  }

  ngAfterViewInit(): void {
    // Initial check after a small delay to ensure DOM is rendered
    setTimeout(() => this.checkInitialLoad(), 100);
  }

  /**
   * Clean up resources when the component is destroyed
   */
  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  /**
   * Fetches navbar items from the server with current filters
   */
  private fetchNavbarItems(): void {
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
      showInActive: this.showInActive,
      listOfRolesCanAccess: validRoles && validRoles.length > 0 ? validRoles : undefined
    };
    
    this.navbarService.getNavbarItems(params).pipe(
      finalize(() => {
        this.isLoading = false;
        this.isPageLoading = false;
        this.isInitialLoad = false;
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

  /**
   * Handles window scroll event for infinite scrolling
   */
  @HostListener('window:scroll')
  onScroll(): void {
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

  /**
   * Checks if more content needs to be loaded on initial render
   */
  private checkInitialLoad(): void {
    const viewportHeight = window.innerHeight;
    const contentHeight = document.documentElement.scrollHeight;
    const viewportNotFilled = contentHeight < viewportHeight;
    
    if (viewportNotFilled && !this.isLoading && this.hasMoreData) {
      this.fetchNavbarItems();
    }
  }

  /**
   * Handles search text changes with debouncing
   */
  onSearchChange(): void {
    this.searchSubject.next(this.searchText);
  }

  /**
   * Handles menu type selection changes
   */
  onMenuTypeChange(selectedType: string | null): void {
    this.selectedMenuType = selectedType;
    this.applyFilters();
  }

  /**
   * Handles role selection changes
   */
  onRolesChange(roles: string[]): void {
    this.selectedRoles = roles || [];
    this.applyFilters();
  }

  /**
   * Loads more items when scrolling
   */
  loadMore(): void {
    if (this.isLoading || !this.hasMoreData) return;
    this.fetchNavbarItems();
  }

  /**
   * Maps a NavbarItemResponse to a NavbarItem with roles array
   */
  private mapToNavbarItem(item: NavbarItemResponse): NavbarItem {
    const roles: string[] = [];
    if (item.canMasterAccess) roles.push('ROLE_MASTER');
    if (item.canAdminAccess) roles.push('ROLE_ADMIN');
    if (item.canUserAccess) roles.push('ROLE_USER');
    if (item.canDoctorAccess) roles.push('ROLE_DOCTOR');
    if (item.canSellerAccess) roles.push('ROLE_SELLER');
    if (item.canRiderAccess) roles.push('ROLE_RIDER');
    if (item.canCustomerCareAccess) roles.push('ROLE_CUSTOMER_CARE');
    if (item.isVisibleToGuest) roles.push('ROLE_GUEST');

    return {
      ...item,
      roles,
      parentId: 'parentId' in item ? (item as any).parentId : null,
      displayOrder: 'displayOrder' in item ? (item as any).displayOrder : 0,
      menuUrl: item.menuLink,
      menuDescription: '',
      dataStatus: (item as any).dataStatus || 'ACTIVE', // Default to ACTIVE if not provided
      updatedAt: (item as any).updatedAt || item.createdDate, // Fallback to createdDate if updatedAt not available
      createdDate: item.createdDate
    } as NavbarItem;
  }

  /**
   * Applies filters to the navbar items
   */
  private applyFilters(): void {
    let filtered = [...this.navbarItems];

    // Filter by search text
    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(item => 
        item.menuName?.toLowerCase().includes(searchLower) ||
        item.menuDescription?.toLowerCase().includes(searchLower) ||
        item.menuUrl?.toLowerCase().includes(searchLower)
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
        return this.selectedRoles.some(role => {
          // Map the role to the corresponding property in the item
          const roleMap: {[key: string]: keyof NavbarItem} = {
            'ROLE_MASTER': 'canMasterAccess',
            'ROLE_ADMIN': 'canAdminAccess',
            'ROLE_CUSTOMER': 'canUserAccess',
            'ROLE_DOCTOR': 'canDoctorAccess',
            'ROLE_SELLER': 'canSellerAccess',
            'ROLE_RAIDER': 'canRiderAccess',
            'ROLE_CUSTOMER_CARE': 'canCustomerCareAccess',
            'ROLE_GUEST': 'isVisibleToGuest'
          };
          
          const roleProperty = roleMap[role];
          return roleProperty ? item[roleProperty] === true : false;
        });
      });
    }
    
    this.filteredNavbarItems = filtered;
  }

  /**
   * Handles filter changes by resetting pagination and fetching new data
   */
  public onFilterChange(): void {
    this.pageIndex = 0;
    this.offsetToken = null;
    this.navbarItems = [];
    this.filteredNavbarItems = [];
    this.hasMoreData = true;
    this.isInitialLoad = true;
    this.fetchNavbarItems();
  }

  /**
   * Formats a date string to a localized date string
   */
  formatDate(dateString: string | Date | null | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  }

  /**
   * Gets a comma-separated list of access levels for a navbar item
   */
  getAccessLevels(item: NavbarItemResponse): string {
    const accessLevels = [];
    if (item.canMasterAccess) accessLevels.push('Master');
    if (item.canAdminAccess) accessLevels.push('Admin');
    if (item.canUserAccess) accessLevels.push('User');
    if (item.canDoctorAccess) accessLevels.push('Doctor');
    if (item.canSellerAccess) accessLevels.push('Seller');
    if (item.canRiderAccess) accessLevels.push('Rider');
    if (item.canCustomerCareAccess) accessLevels.push('Customer Care');
    if (item.isVisibleToGuest) accessLevels.push('Guest');
    
    return accessLevels.join(', ') || 'None';
  }

  /**
   * Constructs a full URL by combining the base URL with the provided path
   */
  getFullUrl(path: string): string {
    if (!path) return '';
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${HOSTER_URL}/${cleanPath}`;
  }

  /**
   * Extracts and formats the roles that have access to the menu item
   */
  getRolesForItem(item: NavbarItem): string[] {
    const roles: string[] = [];
    if (item.canMasterAccess) roles.push('Master');
    if (item.canAdminAccess) roles.push('Admin');
    if (item.canUserAccess) roles.push('User');
    if (item.canDoctorAccess) roles.push('Doctor');
    if (item.canSellerAccess) roles.push('Seller');
    if (item.canRiderAccess) roles.push('Rider');
    if (item.canCustomerCareAccess) roles.push('Customer Care');
    if (item.isVisibleToGuest) roles.push('Guest');
    
    return roles.length > 0 ? roles : ['None'];
} 




  /**
   * Handles the delete button click for a navbar item
   * @param item The navbar item to delete
   */
  onDeleteItem(item: NavbarItem): void {
    console.log('=== onDeleteItem called for item:', item);
    
    if (!item || !item.id) {
      console.error('Invalid item or item ID');
      return;
    }
    
    console.log('Checking if item is a parent menu...');
    
    // First check if this is a parent menu
    const handleParentCheckResponse = (response: ApiResponse<IsParentMenuResponse>) => {
      console.log('Parent check response:', response);
      if (!response.data) {
        throw new Error('Invalid response data');
      }
      
      if (response.data.parentMenu) {
        // If it's a parent menu, show confirmation with submenu count
        const message = `This is a parent menu with ${response.data.subMenuEffectiveCount} submenu(s). ` +
                       'Deleting it will also remove all its submenus. Are you sure you want to continue?';
        
        console.log('Showing parent menu deletion warning');
        this.popupService.showPopup(
          PopupType.WARNING,
          'Confirm Deletion',
          message,
          () => {
            console.log('User confirmed parent menu deletion');
            this.popupService.hidePopup();
            // Directly execute delete without showing another confirmation
            this.executeDelete(item.id);
          },
          () => {
            console.log('User cancelled parent menu deletion');
            this.popupService.hidePopup();
          },
          'Delete',
          'Cancel'
        );
      } else {
        // If not a parent menu, show standard confirmation
        console.log('Item is not a parent menu, showing standard confirmation');
        this.confirmDelete(item.id);
      }
    };
    
    const handleParentCheckError = (error: any) => {
      console.error('Error checking parent menu status:', error);
      this.popupService.showPopup(
        PopupType.ERROR,
        'Error',
        'Failed to check menu status. Please try again.',
        () => this.popupService.hidePopup(),
        undefined,
        'OK'
      );
    };
    
    // Make the API call to check if it's a parent menu
    this.navbarService.isParentMenu(item.id).subscribe({
      next: handleParentCheckResponse,
      error: handleParentCheckError
    });
  }

  /**
   * Confirms and executes the deletion of a navbar item
   * @param id The ID of the navbar item to delete
   */
  private confirmDelete(id: string): void {
    console.log('=== confirmDelete called with ID:', id);
    
    // Show confirmation dialog using popup service
    this.popupService.showPopup(
      PopupType.WARNING,
      'Confirm Deletion',
      'Are you sure you want to delete this menu item?',
      () => {
        console.log('User confirmed deletion');
        this.executeDelete(id);
      },
      () => {
        console.log('User cancelled deletion');
        this.popupService.hidePopup();
      },
      'Delete',
      'Cancel'
    );
  }
  
  /**
   * Executes the delete operation after confirmation
   */
  private executeDelete(id: string): void {
    console.log('=== Executing delete for ID:', id);
    this.isLoading = true;
    
    // Find the item to be deleted to get the SVG file link
    const itemToDelete = this.navbarItems.find(item => item.id === id);
    
    // Function to delete the navbar item
    const deleteNavbarItem = () => {
      this.navbarService.deleteNavbar(id).subscribe({
        next: (response: ApiResponse<any>) => {
          console.log('=== Delete API SUCCESS:', response);
          
          // Show success popup with data status if available
          const statusMessage = response.data?.dataStatus 
            ? `${response.message} (Status: ${response.data.dataStatus})` 
            : response.message;
          
          this.popupService.showPopup(
            PopupType.SUCCESS,
            'Success',
            statusMessage || 'Menu item deleted successfully',
            () => {
              this.popupService.hidePopup();
              // Reload the data after successful deletion
              this.reloadData();
            },
            undefined,
            'OK'
          );
        },
        error: (error: any) => {
          console.error('=== Delete API ERROR:', error);
          this.popupService.showPopup(
            PopupType.ERROR,
            'Deletion Failed',
            error.error?.message || 'Failed to delete menu item. Please try again.',
            () => this.popupService.hidePopup(),
            undefined,
            'OK'
          );
        },
        complete: () => {
          console.log('=== Delete API call completed');
          this.isLoading = false;
        }
      });
    };

    // If there's an SVG file, delete it first
    if (itemToDelete?.svgFileDataLink) {
      this.s3SvgService.deleteSvg(itemToDelete.svgFileDataLink).subscribe({
        next: () => {
          console.log('SVG file deleted successfully');
          // After SVG is deleted, delete the navbar item
          deleteNavbarItem();
        },
        error: (error) => {
          console.error('Error deleting SVG file:', error);
          // Even if SVG deletion fails, still try to delete the navbar item
          deleteNavbarItem();
        }
      });
    } else {
      // No SVG file to delete, just delete the navbar item
      deleteNavbarItem();
    }
  }
  
  /**
   * Reloads the navbar items data
   */
  private reloadData(): void {
    this.isPageLoading = true;
    this.pageIndex = 0;
    this.offsetToken = null;
    this.navbarItems = [];
    this.filteredNavbarItems = [];
    this.hasMoreData = true;
    this.fetchNavbarItems();
  }

  /**
   * Navigates to the view page for the specified navbar item
   * @param event The click event
   * @param item The navbar item to view
   */
  onViewItem(event: Event, item: any): void {
    event.stopPropagation();
    if (item && item.id) {
      this.router.navigate(['/navbar', item.id]);
    } else {
      console.error('Cannot view item: Invalid or missing ID');
      this.popupService.showPopup(
        PopupType.ERROR,
        'Error',
        'Cannot view this item: Invalid or missing ID',
        undefined,
        undefined,
        'OK'
      );
    }
  }

  /**
   * Navigates to the edit page for the specified navbar item
   * @param event The click event
   * @param item The navbar item to edit
   */
  onEditItem(event: Event, item: any): void {
    event.stopPropagation();
    if (item && item.id) {
      this.router.navigate(['/navbar/edit', item.id]);
    } else {
      console.error('Cannot edit item: Invalid or missing ID');
      this.popupService.showPopup(
        PopupType.ERROR,
        'Error',
        'Cannot edit this item: Invalid or missing ID',
        undefined,
        undefined,
        'OK'
      );
    }
  }
}
