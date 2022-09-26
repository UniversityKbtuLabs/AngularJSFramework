import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FXOpenAccountModalComponent } from './f-x-open-account-modal.component';

describe('FXOpenAccountModalComponent', () => {
  let component: FXOpenAccountModalComponent;
  let fixture: ComponentFixture<FXOpenAccountModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FXOpenAccountModalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FXOpenAccountModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
