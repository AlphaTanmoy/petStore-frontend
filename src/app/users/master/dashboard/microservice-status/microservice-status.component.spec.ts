import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MicroserviceStatusComponent } from './microservice-status.component';

describe('MicroserviceStatusComponent', () => {
  let component: MicroserviceStatusComponent;
  let fixture: ComponentFixture<MicroserviceStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MicroserviceStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MicroserviceStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
