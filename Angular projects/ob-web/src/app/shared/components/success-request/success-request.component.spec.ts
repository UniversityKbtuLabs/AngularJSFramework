import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessRequestComponent } from './success-request.component';

describe('SuccessRequestComponent', () => {
  let component: SuccessRequestComponent;
  let fixture: ComponentFixture<SuccessRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuccessRequestComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SuccessRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
