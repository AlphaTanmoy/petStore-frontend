import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from './date-picker.component';

@Component({
  selector: 'app-date-picker-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerComponent],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Date Picker Demo</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Select a date:</label>
                <app-date-picker 
                  [(selectedDate)]="selectedDate"
                  [minDate]="minDate"
                  [maxDate]="maxDate"
                  placeholder="Click to select a date"
                  (dateChange)="onDateChange($event)">
                </app-date-picker>
              </div>
              
              <div *ngIf="selectedDate" class="alert alert-info mt-3">
                <strong>Selected Date:</strong> {{ selectedDate | date:'fullDate' }}
              </div>
              
              <div class="mt-4">
                <h6>Usage Example:</h6>
                <pre class="bg-light p-3 rounded"><code>
// In your component:
selectedDate: Date | null = null;
minDate: Date = new Date(); // Today
maxDate: Date = new Date(new Date().setFullYear(new Date().getFullYear() + 1)); // 1 year from now

// In your template:
&lt;app-date-picker
  [(selectedDate)]="selectedDate"
  [minDate]="minDate"
  [maxDate]="maxDate"
  placeholder="Select a date"
  (dateChange)="onDateChange($event)"&gt;
&lt;/app-date-picker&gt;
                </code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    pre {
      font-size: 14px;
    }
    
    .card {
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }
  `]
})
export class DatePickerDemoComponent {
  selectedDate: Date | null = null;
  minDate: Date | null = null; // Allow all past dates
  maxDate: Date | null = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

  onDateChange(date: Date | null): void {
    console.log('Date changed:', date);
  }
}
