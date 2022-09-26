import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationsFilterComponent } from './operations-filter.component';

describe('OperationsFilterComponent', () => {
  let component: OperationsFilterComponent;
  let fixture: ComponentFixture<OperationsFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OperationsFilterComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
