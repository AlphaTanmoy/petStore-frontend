import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SingleSelectComponent } from './single-select.component';

@Component({
  selector: 'app-single-select-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, SingleSelectComponent],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Single Select Dropdown Demo</h5>
            </div>
            <div class="card-body">
              <div class="row mb-4">
                <div class="col-md-6">
                  <h6>Basic Usage</h6>
                  <div class="mb-3">
                    <label class="form-label">Select a fruit:</label>
                    <app-single-select 
                      [options]="fruits"
                      [(selectedOption)]="selectedFruit"
                      placeholder="Select a fruit"
                      (selectionChange)="onSelectionChange($event)">
                    </app-single-select>
                  </div>
                  
                  <div *ngIf="selectedFruit" class="alert alert-info mt-3">
                    <strong>Selected:</strong> {{ selectedFruit }}
                  </div>
                </div>
                
                <div class="col-md-6">
                  <h6>With Search (appears when more than 5 items)</h6>
                  <div class="mb-3">
                    <label class="form-label">Select a country:</label>
                    <app-single-select 
                      [options]="countries"
                      [(selectedOption)]="selectedCountry"
                      placeholder="Select a country"
                      maxHeight="250px">
                    </app-single-select>
                  </div>
                </div>
              </div>
              
              <div class="mt-4">
                <h6>Usage Example:</h6>
                <pre class="bg-light p-3 rounded"><code>
// In your component:
options: string[] = ['Option 1', 'Option 2', 'Option 3'];
selectedOption: string | null = null;

// In your template:
&lt;app-single-select
  [options]="options"
  [(selectedOption)]="selectedOption"
  placeholder="Select an option"
  [maxHeight]="'200px'"
  (selectionChange)="onSelectionChange($event)"&gt;
&lt;/app-single-select&gt;
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
export class SingleSelectDemoComponent {
  // Sample data
  fruits = ['Apple', 'Banana', 'Orange', 'Mango', 'Grapes', 'Pineapple', 'Watermelon'];
  countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
    'France', 'Japan', 'China', 'Brazil', 'India', 'Russia', 'South Africa',
    'Mexico', 'Spain', 'Italy', 'Netherlands', 'South Korea', 'Singapore'
  ];
  
  selectedFruit: string | null = null;
  selectedCountry: string | null = null;

  onSelectionChange(selected: string | null) {
    console.log('Selection changed:', selected);
  }
}
