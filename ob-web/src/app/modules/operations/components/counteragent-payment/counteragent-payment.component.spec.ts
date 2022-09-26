import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CounteragentPaymentComponent } from './counteragent-payment.component';

describe('CounteragentPaymentComponent', () => {
  let component: CounteragentPaymentComponent;
  let fixture: ComponentFixture<CounteragentPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CounteragentPaymentComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CounteragentPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
