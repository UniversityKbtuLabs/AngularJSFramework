import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FXAddTradingSignalComponent } from './fx-add-trading-signal.component';

describe('FXAddTradingSignalComponent', () => {
  let component: FXAddTradingSignalComponent;
  let fixture: ComponentFixture<FXAddTradingSignalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FXAddTradingSignalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FXAddTradingSignalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
