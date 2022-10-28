import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyTransferComponent } from './currency-transfer.component';

describe('CurrencyTransferComponent', () => {
  let component: CurrencyTransferComponent;
  let fixture: ComponentFixture<CurrencyTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CurrencyTransferComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrencyTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
