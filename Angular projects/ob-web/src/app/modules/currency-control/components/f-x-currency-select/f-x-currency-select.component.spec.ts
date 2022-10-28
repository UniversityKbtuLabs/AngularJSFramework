import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FXCurrencySelectComponent } from './f-x-currency-select.component';

describe('FXCurrencySelectComponent', () => {
  let component: FXCurrencySelectComponent;
  let fixture: ComponentFixture<FXCurrencySelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FXCurrencySelectComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FXCurrencySelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
