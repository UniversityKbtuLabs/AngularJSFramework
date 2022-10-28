import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsModalComponent } from './sms-modal.component';

describe('SmsModalComponent', () => {
  let component: SmsModalComponent;
  let fixture: ComponentFixture<SmsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SmsModalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
