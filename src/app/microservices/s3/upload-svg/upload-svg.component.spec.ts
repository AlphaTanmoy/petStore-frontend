import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadSvgComponent } from './upload-svg.component';

describe('UploadSvgComponent', () => {
  let component: UploadSvgComponent;
  let fixture: ComponentFixture<UploadSvgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadSvgComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
