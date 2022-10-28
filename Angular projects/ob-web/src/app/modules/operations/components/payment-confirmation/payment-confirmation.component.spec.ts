import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentConfitmationComponent } from './payment-confitmation.component';

describe('PaymentConfitmationComponent', () => {
  let component: PaymentConfitmationComponent;
  let fixture: ComponentFixture<PaymentConfitmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentConfitmationComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentConfitmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
