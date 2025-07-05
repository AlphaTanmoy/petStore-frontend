import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MultiSelectComponent } from './multi-select.component';

@Component({
  selector: 'app-multi-select-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, MultiSelectComponent],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Multi-Select Dropdown Demo</h5>
            </div>
            <div class="card-body">
              <div class="row mb-4">
                <div class="col-md-6">
                  <h6>Basic Multi-Select</h6>
                  <div class="mb-3">
                    <label class="form-label">Select multiple fruits:</label>
                    <app-multi-select 
                      [options]="fruits"
                      [(selectedOptions)]="selectedFruits"
                      placeholder="Select fruits"
                      (selectionChange)="onSelectionChange($event)">
                    </app-multi-select>
                  </div>
                  
                  <div *ngIf="selectedFruits.length > 0" class="alert alert-info mt-3">
                    <strong>Selected:</strong> {{ selectedFruits.join(', ') }}
                  </div>
                </div>
                
                <div class="col-md-6">
                  <h6>With Max Selections</h6>
                  <div class="mb-3">
                    <label class="form-label">Select up to 3 countries:</label>
                    <app-multi-select 
                      [options]="countries"
                      [(selectedOptions)]="selectedCountries"
                      [maxSelections]="3"
                      placeholder="Select countries (max 3)"
                      maxHeight="250px">
                    </app-multi-select>
                  </div>
                  
                  <div *ngIf="selectedCountries.length > 0" class="alert alert-info mt-3">
                    <strong>Selected:</strong> {{ selectedCountries.join(', ') }}
                  </div>
                </div>
              </div>
              
              <div class="mt-4">
                <h6>Usage Example:</h6>
                <pre class="bg-light p-3 rounded"><code>
// In your component:
options: string[] = ['Option 1', 'Option 2', 'Option 3'];
selectedOptions: string[] = [];

// In your template:
&lt;app-multi-select
  [options]="options"
  [(selectedOptions)]="selectedOptions"
  [maxSelections]="3" // Optional: limit number of selections
  placeholder="Select options"
  [maxHeight]="'200px'"
  (selectionChange)="onSelectionChange($event)"&gt;
&lt;/app-multi-select&gt;
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
    
    h6 {
      color: #495057;
      font-weight: 600;
      margin-bottom: 1rem;
    }
  `]
})
export class MultiSelectDemoComponent {
  // Sample data
  fruits = ['Apple', 'Banana', 'Orange', 'Mango', 'Grapes', 'Pineapple', 'Watermelon'];
  countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
    'France', 'Japan', 'China', 'Brazil', 'India', 'Russia', 'South Africa',
    'Mexico', 'Spain', 'Italy', 'Netherlands', 'South Korea', 'Singapore'
  ];
  
  selectedFruits: string[] = [];
  selectedCountries: string[] = [];

  onSelectionChange(selected: string[]) {
    console.log('Selection changed:', selected);
  }
}
