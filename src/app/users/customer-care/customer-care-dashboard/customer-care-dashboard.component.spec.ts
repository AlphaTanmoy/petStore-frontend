import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerCareDashboardComponent } from './customer-care-dashboard.component';

describe('CustomerCareDashboardComponent', () => {
  let component: CustomerCareDashboardComponent;
  let fixture: ComponentFixture<CustomerCareDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerCareDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerCareDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
