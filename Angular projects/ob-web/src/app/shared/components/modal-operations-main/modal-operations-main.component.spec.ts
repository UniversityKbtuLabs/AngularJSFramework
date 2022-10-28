import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOperationsMainComponent } from './modal-operations-main.component';

describe('ModalOperationsMainComponent', () => {
  let component: ModalOperationsMainComponent;
  let fixture: ComponentFixture<ModalOperationsMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalOperationsMainComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalOperationsMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
