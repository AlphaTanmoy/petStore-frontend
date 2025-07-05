import { Component, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css']
})
export class DatePickerComponent {
  @Input() placeholder: string = 'Select a date';
  @Input() minDate: Date | null = null;
  @Input() maxDate: Date | null = null;
  @Input() selectedDate: Date | null = null;
  @Output() selectedDateChange = new EventEmitter<Date | null>();
  @Output() dateChange = new EventEmitter<Date | null>();

  @ViewChild('dateInput') dateInput!: ElementRef;
  @ViewChild('calendar') calendar!: ElementRef;

  showCalendar: boolean = false;
  currentMonth: Date = new Date();
  weeks: Date[][] = [];
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  monthNames: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(private elementRef: ElementRef) {
    this.generateCalendar();
  }

  toggleCalendar(): void {
    this.showCalendar = !this.showCalendar;
    if (this.showCalendar) {
      this.generateCalendar();
      setTimeout(() => this.focusInput(), 0);
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target) && 
        !(this.calendar?.nativeElement?.contains(event.target))) {
      this.showCalendar = false;
    }
  }

  generateCalendar(): void {
    const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const lastDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
    
    // Adjust to start the week on Sunday
    const firstDayIndex = firstDay.getDay();
    const lastDayIndex = lastDay.getDay();
    const prevMonthDays = firstDayIndex;
    const nextMonthDays = 6 - lastDayIndex;
    
    const daysInMonth = lastDay.getDate();
    const daysInPrevMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 0).getDate();
    
    const days: Date[] = [];
    
    // Previous month days
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      days.push(new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, daysInPrevMonth - i));
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), i));
    }
    
    // Next month days
    for (let i = 1; i <= nextMonthDays; i++) {
      days.push(new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, i));
    }
    
    // Split into weeks
    this.weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      this.weeks.push(days.slice(i, i + 7));
    }
  }

  selectDate(date: Date): void {
    // Create a new date without time components for comparison
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (this.isDateDisabled(selectedDate)) return;
    
    this.selectedDate = selectedDate;
    this.selectedDateChange.emit(this.selectedDate);
    this.dateChange.emit(this.selectedDate);
    this.showCalendar = false;
  }

  isSelected(date: Date): boolean {
    if (!this.selectedDate) return false;
    
    // Compare year, month, and day only
    return date.getFullYear() === this.selectedDate.getFullYear() &&
           date.getMonth() === this.selectedDate.getMonth() &&
           date.getDate() === this.selectedDate.getDate();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth.getMonth() && 
           date.getFullYear() === this.currentMonth.getFullYear();
  }

  isDateDisabled(date: Date): boolean {
    // Only disable dates outside the min/max range, not dates from other months
    if (this.minDate && date < new Date(this.minDate.getFullYear(), this.minDate.getMonth(), this.minDate.getDate())) return true;
    if (this.maxDate && date > new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), this.maxDate.getDate())) return true;
    return false;
  }

  prevMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar();
  }

  prevYear(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear() - 1, this.currentMonth.getMonth(), 1);
    this.generateCalendar();
  }

  nextYear(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear() + 1, this.currentMonth.getMonth(), 1);
    this.generateCalendar();
  }

  selectToday(): void {
    const today = new Date();
    this.selectedDate = new Date(today);
    this.currentMonth = new Date(today);
    this.selectedDateChange.emit(this.selectedDate);
    this.dateChange.emit(this.selectedDate);
    this.showCalendar = false;
  }

  clearDate(): void {
    this.selectedDate = null;
    this.selectedDateChange.emit(null);
    this.dateChange.emit(null);
  }

  private focusInput(): void {
    if (this.dateInput) {
      this.dateInput.nativeElement.focus();
    }
  }
}
