import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyControlComponent } from './currency-control.component';

describe('CurrencyControlComponent', () => {
  let component: CurrencyControlComponent;
  let fixture: ComponentFixture<CurrencyControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CurrencyControlComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrencyControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
