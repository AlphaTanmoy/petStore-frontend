import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterLoginComponent } from './master-login.component';

describe('MasterLoginComponent', () => {
  let component: MasterLoginComponent;
  let fixture: ComponentFixture<MasterLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
