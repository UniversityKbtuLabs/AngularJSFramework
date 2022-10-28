import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FXCurrencyesGraphComponent } from './fx-currencyes-graph.component';

describe('FXCurrencyesGraphComponent', () => {
  let component: FXCurrencyesGraphComponent;
  let fixture: ComponentFixture<FXCurrencyesGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FXCurrencyesGraphComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FXCurrencyesGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
