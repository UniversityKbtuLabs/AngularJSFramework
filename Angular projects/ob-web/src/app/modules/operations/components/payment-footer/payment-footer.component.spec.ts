import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentFooterComponent } from './payment-footer.component';

describe('PaymentFooterComponent', () => {
  let component: PaymentFooterComponent;
  let fixture: ComponentFixture<PaymentFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentFooterComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
