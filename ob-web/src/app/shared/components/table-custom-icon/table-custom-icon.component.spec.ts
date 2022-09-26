import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCustomIconComponent } from './table-custom-icon.component';

describe('TableCustomIconComponent', () => {
  let component: TableCustomIconComponent;
  let fixture: ComponentFixture<TableCustomIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableCustomIconComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCustomIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
