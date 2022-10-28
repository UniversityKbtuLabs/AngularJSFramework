import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargeModalComponent } from './discharge-modal.component';

describe('DischargeModalComponent', () => {
  let component: DischargeModalComponent;
  let fixture: ComponentFixture<DischargeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DischargeModalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DischargeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
