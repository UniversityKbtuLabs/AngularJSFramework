import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSelectOptionComponent } from './account-select-option.component';

describe('AccountSelectOptionComponent', () => {
  let component: AccountSelectOptionComponent;
  let fixture: ComponentFixture<AccountSelectOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountSelectOptionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountSelectOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
