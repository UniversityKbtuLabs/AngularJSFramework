import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonPaymentComponent } from './common-payment.component';

describe('CommonPaymentComponent', () => {
  let component: CommonPaymentComponent;
  let fixture: ComponentFixture<CommonPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommonPaymentComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
