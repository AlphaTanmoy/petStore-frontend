import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewCustomersComponent } from './view-customers.component';
import { FormsModule } from '@angular/forms';

describe('ViewCustomersComponent', () => {
  let component: ViewCustomersComponent;
  let fixture: ComponentFixture<ViewCustomersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewCustomersComponent ],
      imports: [ FormsModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
  