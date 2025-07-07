import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MvnManagementComponent } from './mvn-management.component';

describe('MvnManagementComponent', () => {
  let component: MvnManagementComponent;
  let fixture: ComponentFixture<MvnManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MvnManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MvnManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
