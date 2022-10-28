import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounteragentListComponent } from './counteragent-list.component';

describe('CounteragentListComponent', () => {
  let component: CounteragentListComponent;
  let fixture: ComponentFixture<CounteragentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CounteragentListComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CounteragentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
