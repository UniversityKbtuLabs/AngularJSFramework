import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FXTradingSignalTableComponent } from './fx-trading-signal-table.component';

describe('FXTradingSignalTableComponent', () => {
  let component: FXTradingSignalTableComponent;
  let fixture: ComponentFixture<FXTradingSignalTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FXTradingSignalTableComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FXTradingSignalTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
