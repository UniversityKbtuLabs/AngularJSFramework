import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDepositComponent } from './create-deposit.component';

describe('CreateDepositComponent', () => {
  let component: CreateDepositComponent;
  let fixture: ComponentFixture<CreateDepositComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateDepositComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDepositComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
