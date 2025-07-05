import { Component, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-single-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './single-select.component.html',
  styleUrls: ['./single-select.component.css']
})
export class SingleSelectComponent {
  @Input() options: string[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input() selectedOption: string | null = null;
  @Input() maxHeight: string = '200px';
  @Output() selectedOptionChange = new EventEmitter<string | null>();
  @Output() selectionChange = new EventEmitter<string | null>();

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

  selectOption(option: string) {
    this.selectedOption = option;
    this.selectedOptionChange.emit(option);
    this.selectionChange.emit(option);
    this.isOpen = false;
    this.searchQuery = '';
    this.filteredOptions = this.filterOptions('');
  }

  clearSelection(event: Event) {
    event.stopPropagation();
    this.selectedOption = null;
    this.selectedOptionChange.emit(null);
    this.selectionChange.emit(null);
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

  constructor(private elementRef: ElementRef) {}
}
