import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsTableComponent } from './savings-table.component';

describe('SavingsTableComponent', () => {
  let component: SavingsTableComponent;
  let fixture: ComponentFixture<SavingsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SavingsTableComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
