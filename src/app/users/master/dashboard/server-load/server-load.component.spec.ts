import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerLoadComponent } from './server-load.component';

describe('ServerLoadComponent', () => {
  let component: ServerLoadComponent;
  let fixture: ComponentFixture<ServerLoadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerLoadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
