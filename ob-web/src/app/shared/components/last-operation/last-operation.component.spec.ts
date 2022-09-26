import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LastOperationComponent } from './last-operation.component';

describe('LastOperationComponent', () => {
  let component: LastOperationComponent;
  let fixture: ComponentFixture<LastOperationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LastOperationComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LastOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
