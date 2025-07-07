import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MicroserviceManagementComponent } from './microservice-management.component';

describe('MicroserviceManagementComponent', () => {
  let component: MicroserviceManagementComponent;
  let fixture: ComponentFixture<MicroserviceManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MicroserviceManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MicroserviceManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
