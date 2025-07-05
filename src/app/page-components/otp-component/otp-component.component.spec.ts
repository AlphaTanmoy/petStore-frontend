import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpComponentComponent } from './otp-component.component';

describe('OtpComponentComponent', () => {
  let component: OtpComponentComponent;
  let fixture: ComponentFixture<OtpComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtpComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtpComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
