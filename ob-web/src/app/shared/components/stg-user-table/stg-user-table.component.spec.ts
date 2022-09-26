import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StgUserTableComponent } from './stg-user-table.component';

describe('StgUserTableComponent', () => {
  let component: StgUserTableComponent;
  let fixture: ComponentFixture<StgUserTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StgUserTableComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StgUserTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
