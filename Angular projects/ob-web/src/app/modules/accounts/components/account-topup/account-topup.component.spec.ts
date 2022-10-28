import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountTopupComponent } from './account-topup.component';

describe('AccountTopupComponent', () => {
  let component: AccountTopupComponent;
  let fixture: ComponentFixture<AccountTopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountTopupComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountTopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
