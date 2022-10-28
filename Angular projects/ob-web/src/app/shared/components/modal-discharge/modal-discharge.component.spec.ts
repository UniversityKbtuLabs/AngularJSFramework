import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDischargeComponent } from './modal-discharge.component';

describe('ModalDischargeComponent', () => {
  let component: ModalDischargeComponent;
  let fixture: ComponentFixture<ModalDischargeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalDischargeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDischargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
