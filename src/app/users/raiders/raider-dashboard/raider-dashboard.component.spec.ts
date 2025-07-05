import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiderDashboardComponent } from './raider-dashboard.component';

describe('RaiderDashboardComponent', () => {
  let component: RaiderDashboardComponent;
  let fixture: ComponentFixture<RaiderDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaiderDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RaiderDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
