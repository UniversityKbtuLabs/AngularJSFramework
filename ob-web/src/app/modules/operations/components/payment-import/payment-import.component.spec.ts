import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentImportModalComponent } from './payment-import.component';

describe('TableModalComponent', () => {
  let component: PaymentImportModalComponent;
  let fixture: ComponentFixture<PaymentImportModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentImportModalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentImportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
