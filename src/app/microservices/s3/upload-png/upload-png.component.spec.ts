import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadPngComponent } from './upload-png.component';

describe('UploadPngComponent', () => {
  let component: UploadPngComponent;
  let fixture: ComponentFixture<UploadPngComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadPngComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadPngComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
