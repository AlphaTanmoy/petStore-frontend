import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNabvarComponent } from './add-nabvar.component';

describe('AddNabvarComponent', () => {
  let component: AddNabvarComponent;
  let fixture: ComponentFixture<AddNabvarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNabvarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNabvarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
