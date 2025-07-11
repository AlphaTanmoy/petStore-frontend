import { Component, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.css']
})
export class MultiSelectComponent {
  @Input() options: SelectOption[] = [];
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
  filteredOptions: SelectOption[] = [];

  ngOnInit() {
    this.filteredOptions = [...this.options];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options'] || changes['searchQuery']) {
      this.filteredOptions = this.filterOptions(this.searchQuery);
    }
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

  toggleOption(option: SelectOption) {
    const index = this.selectedOptions.indexOf(option.value);
    if (index === -1) {
      if (this.maxSelections === null || this.selectedOptions.length < this.maxSelections) {
        this.selectedOptions = [...this.selectedOptions, option.value];
        this.emitChanges();
      }
    } else {
      this.selectedOptions = this.selectedOptions.filter(item => item !== option.value);
      this.emitChanges();
    }
  }

  isSelected(option: SelectOption): boolean {
    return this.selectedOptions.includes(option.value);
  }

  clearAll(event: Event) {
    event.stopPropagation();
    this.selectedOptions = [];
    this.emitChanges();
  }

  removeOption(event: Event, option: string) {
    event.stopPropagation();
    this.selectedOptions = this.selectedOptions.filter(item => item !== option);
    this.emitChanges();
  }

  private emitChanges() {
    this.selectedOptionsChange.emit([...this.selectedOptions]);
    this.selectionChange.emit([...this.selectedOptions]);
  }

  getOptionLabel(value: string): string {
    const option = this.options.find(opt => opt.value === value);
    return option ? option.label : value;
  }

  trackByFn(index: number, item: SelectOption | string): string {
    return typeof item === 'string' ? item : item.value;
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    this.filteredOptions = this.filterOptions(query);
  }

  private filterOptions(query: string): SelectOption[] {
    if (!query) {
      return [...this.options];
    }
    const lowerCaseQuery = query.toLowerCase();
    return this.options.filter(option => 
      option.label.toLowerCase().includes(lowerCaseQuery) || 
      option.value.toLowerCase().includes(lowerCaseQuery)
    );
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
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
