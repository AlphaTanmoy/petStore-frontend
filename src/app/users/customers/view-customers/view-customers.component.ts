import { Component, HostListener, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerViewService } from '../../../services/customer.view.service';
import { PopupService } from '../../../services/popup.service';
import { PopupType } from '../../../constants/enums/popup-types';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { SingleSelectComponent } from '../../../page-components/single-select/single-select.component';

interface Customer {
  id: string;
  fullName: string;
  emailId: string;
  tireCode: string;
  userRole: string;
  isPrimeMember: boolean;
  createdDate?: string;
}

interface ApiResponse {
  data: Customer[];
  offsetToken: string | null;
  recordCount: number;
}

@Component({
  selector: 'app-view-customers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SingleSelectComponent
  ],
  templateUrl: './view-customers.component.html',
  styleUrls: ['./view-customers.component.css']
})
export class ViewCustomersComponent implements OnInit, AfterViewInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  offsetToken: string | null = null;
  isLoading = false;
  hasMoreData = true;
  isInitialLoad = true;

  // Filter properties
  filterRole = '';
  searchText = '';
  isPrime = false;

  // Handle search input changes with debounce
  private searchSubject = new Subject<string>();
  
  constructor(
    private customerService: CustomerViewService,
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
    this.fetchCustomers();
  }

  fetchCustomers(): void {
    if (this.isLoading || !this.hasMoreData) return;
    
    this.isLoading = true;
    
    // Only pass offsetToken if we have one and it's not the initial load
    const offset = !this.isInitialLoad && this.offsetToken ? this.offsetToken : undefined;

    this.customerService.getCustomers(offset).subscribe({
      next: (response: ApiResponse) => {
        const newCustomers = response.data || [];
        
        if (newCustomers.length === 0) {
          this.hasMoreData = false;
        } else {
          // Only append new customers if it's not the initial load
          if (this.isInitialLoad) {
            this.customers = [...newCustomers];
          } else {
            this.customers = [...this.customers, ...newCustomers];
          }
          
          // Update offset token for next request
          this.offsetToken = response.offsetToken || null;
          this.hasMoreData = !!this.offsetToken; // If we have an offset token, there might be more data
          this.applyFilters();
        }
        
        this.isLoading = false;
        this.isInitialLoad = false;

        // Check if we need to load more after updating the data
        if (this.hasMoreData) {
          setTimeout(() => {
            if (this.shouldLoadMore()) {
              this.fetchCustomers();
            }
          }, 100);
        }
      },
      error: (error) => {
        console.error('Error fetching customers:', error);
        this.isLoading = false;
        this.isInitialLoad = false;
        this.hasMoreData = false; // Stop trying to load more on error
        this.popupService.showPopup(PopupType.ERROR, 'Error', 'Failed to load customers');
      }
    });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (this.shouldLoadMore()) {
      this.fetchCustomers();
    }
  }

  private lastLoadTime: number = 0;
  private loadDebounceTime: number = 500; // 500ms debounce time

  private shouldLoadMore(): boolean {
    // Prevent multiple rapid checks
    const now = Date.now();
    if (now - this.lastLoadTime < this.loadDebounceTime) {
      return false;
    }

    if (this.isLoading || !this.hasMoreData || this.isInitialLoad) {
      return false;
    }
    
    const viewportHeight = window.innerHeight;
    const scrollPosition = window.scrollY;
    const contentHeight = document.documentElement.scrollHeight;
    const distanceToBottom = contentHeight - (scrollPosition + viewportHeight);
    
    // Check if we're near the bottom of the page (within 100px)
    const nearBottom = distanceToBottom < 100;
    
    // Check if viewport is not filled with content
    const viewportNotFilled = contentHeight < viewportHeight;
    
    // If either condition is true and we haven't loaded recently, load more
    if (nearBottom || viewportNotFilled) {
      this.lastLoadTime = now;
      return true;
    }
    
    return false;
  }

  // Add this method to check if we need to load more on initial render
  private checkInitialLoad(): void {
    if (this.shouldLoadMore()) {
      this.fetchCustomers();
    }
  }

  // Call this after the view is initialized
  ngAfterViewInit(): void {
    // Initial check after a small delay to ensure DOM is rendered
    setTimeout(() => this.checkInitialLoad(), 100);
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchText);
  }

  // Handle role filter change from custom select
  onRoleChange(role: string | null): void {
    // Convert 'All Roles' to empty string for filtering
    this.filterRole = role === 'All Roles' ? '' : (role || '');
    this.onFilterChange();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredCustomers = this.customers.filter(customer => {
      const matchesRole = !this.filterRole || customer.userRole === this.filterRole;
      const matchesSearch = !this.searchText || 
        customer.fullName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        customer.emailId?.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesPrime = !this.isPrime || customer.isPrimeMember === this.isPrime;
      
      return matchesRole && matchesSearch && matchesPrime;
    });
  }
}
