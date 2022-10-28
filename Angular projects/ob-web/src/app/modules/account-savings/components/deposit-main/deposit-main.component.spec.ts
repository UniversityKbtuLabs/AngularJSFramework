import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositMainComponent } from './deposit-main.component';

describe('DepositMainComponent', () => {
  let component: DepositMainComponent;
  let fixture: ComponentFixture<DepositMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DepositMainComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DepositMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
