import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StgEmployeeTableComponent } from './stg-employee-table.component';

describe('StgEmployeeTableComponent', () => {
  let component: StgEmployeeTableComponent;
  let fixture: ComponentFixture<StgEmployeeTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StgEmployeeTableComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StgEmployeeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
