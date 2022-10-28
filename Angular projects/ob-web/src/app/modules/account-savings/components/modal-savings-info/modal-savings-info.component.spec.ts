import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSavingsInfoComponent } from './modal-savings-info.component';

describe('ModalSavingsInfoComponent', () => {
  let component: ModalSavingsInfoComponent;
  let fixture: ComponentFixture<ModalSavingsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalSavingsInfoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSavingsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
