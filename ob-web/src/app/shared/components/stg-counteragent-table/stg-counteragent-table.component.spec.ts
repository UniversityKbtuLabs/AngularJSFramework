import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StgCounteragentTableComponent } from './stg-counteragent-table.component';

describe('StgCounteragentTableComponent', () => {
  let component: StgCounteragentTableComponent;
  let fixture: ComponentFixture<StgCounteragentTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StgCounteragentTableComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StgCounteragentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
