import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationActionsComponent } from './operation-actions.component';

describe('OperationActionsComponent', () => {
  let component: OperationActionsComponent;
  let fixture: ComponentFixture<OperationActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OperationActionsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
