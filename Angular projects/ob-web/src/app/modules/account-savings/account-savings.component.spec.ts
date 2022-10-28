import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSavingsComponent } from './account-savings.component';

describe('AccountSavingsComponent', () => {
  let component: AccountSavingsComponent;
  let fixture: ComponentFixture<AccountSavingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountSavingsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountSavingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
