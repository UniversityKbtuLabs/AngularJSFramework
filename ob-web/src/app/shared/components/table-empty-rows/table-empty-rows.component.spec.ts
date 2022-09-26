import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableEmptyRowsComponent } from './table-empty-rows.component';

describe('TableEmptyRowsComponent', () => {
  let component: TableEmptyRowsComponent;
  let fixture: ComponentFixture<TableEmptyRowsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableEmptyRowsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableEmptyRowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
