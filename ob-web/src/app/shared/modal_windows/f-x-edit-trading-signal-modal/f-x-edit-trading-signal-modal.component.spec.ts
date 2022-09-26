import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FXEditTradingSignalModalComponent } from './f-x-edit-trading-signal-modal.component';

describe('FXEditTradingSignalModalComponent', () => {
  let component: FXEditTradingSignalModalComponent;
  let fixture: ComponentFixture<FXEditTradingSignalModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FXEditTradingSignalModalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FXEditTradingSignalModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
