import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadJpgComponent } from './upload-jpg.component';

describe('UploadJpgComponent', () => {
  let component: UploadJpgComponent;
  let fixture: ComponentFixture<UploadJpgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadJpgComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadJpgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
