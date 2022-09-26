import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeAccountsComponent } from './home-accounts.component';

describe('HomeAccountsComponent', () => {
  let component: HomeAccountsComponent;
  let fixture: ComponentFixture<HomeAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeAccountsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
