import { Component, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.css']
})
export class MultiSelectComponent {
  @Input() options: string[] = [];
  @Input() placeholder: string = 'Select options';
  @Input() selectedOptions: string[] = [];
  @Input() maxHeight: string = '200px';
  @Input() maxSelections: number | null = null;
  @Input() disabled: boolean = false;
  @Output() selectedOptionsChange = new EventEmitter<string[]>();
  @Output() selectionChange = new EventEmitter<string[]>();

  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;

  isOpen = false;
  searchQuery = '';
  filteredOptions: string[] = [];

  ngOnInit() {
    this.filteredOptions = [...this.options];
  }

  ngOnChanges() {
    this.filteredOptions = this.filterOptions(this.searchQuery);
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      // Focus search input when dropdown opens
      setTimeout(() => {
        if (this.searchInput) {
          this.searchInput.nativeElement.focus();
        }
      });
    }
  }

  toggleOption(option: string) {
    const index = this.selectedOptions.indexOf(option);
    if (index === -1) {
      // Check if max selections is reached
      if (this.maxSelections && this.selectedOptions.length >= this.maxSelections) {
        return;
      }
      this.selectedOptions = [...this.selectedOptions, option];
    } else {
      this.selectedOptions = this.selectedOptions.filter(item => item !== option);
    }
    
    this.selectedOptionsChange.emit([...this.selectedOptions]);
    this.selectionChange.emit([...this.selectedOptions]);
  }

  isSelected(option: string): boolean {
    return this.selectedOptions.includes(option);
  }

  clearAll(event: Event) {
    event.stopPropagation();
    this.selectedOptions = [];
    this.selectedOptionsChange.emit([]);
    this.selectionChange.emit([]);
  }

  removeOption(event: Event, option: string) {
    event.stopPropagation();
    this.selectedOptions = this.selectedOptions.filter(item => item !== option);
    this.selectedOptionsChange.emit([...this.selectedOptions]);
    this.selectionChange.emit([...this.selectedOptions]);
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    this.filteredOptions = this.filterOptions(query);
  }

  private filterOptions(query: string): string[] {
    if (!query) return [...this.options];
    return this.options.filter(option => 
      option.toLowerCase().includes(query.toLowerCase())
    );
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  trackByFn(index: number, item: string): string {
    return item;
  }

  get selectedOptionsText(): string {
    if (this.selectedOptions.length === 0) return this.placeholder;
    if (this.selectedOptions.length <= 2) {
      return this.selectedOptions.join(', ');
    }
    return `${this.selectedOptions.length} selected`;
  }

  constructor(private elementRef: ElementRef) {}
}
