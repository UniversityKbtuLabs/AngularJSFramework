import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FXCurrencyesComponent } from './fx-currencyes.component';

describe('FXCurrencyesComponent', () => {
  let component: FXCurrencyesComponent;
  let fixture: ComponentFixture<FXCurrencyesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FXCurrencyesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FXCurrencyesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
